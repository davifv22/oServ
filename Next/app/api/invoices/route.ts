import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BoletoStatus, InvoiceStatus } from '@prisma/client'

const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED']
const BOLETO_STATUSES: BoletoStatus[] = ['PENDING', 'PAID', 'EXPIRED', 'CANCELED']

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function nullableString(value: unknown) {
  const text = normalizeString(value)
  return text || null
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

function parseDate(value: unknown) {
  const text = normalizeString(value)
  if (!text) return null
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function round2(value: number) {
  return Number(value.toFixed(2))
}

function hasOwn(body: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(body, key)
}

function parseInvoiceStatus(value: unknown) {
  const text = normalizeString(value).toUpperCase()
  if (!text) return null
  return INVOICE_STATUSES.includes(text as InvoiceStatus) ? (text as InvoiceStatus) : null
}

function parseBoletoStatus(value: unknown) {
  const text = normalizeString(value).toUpperCase()
  if (!text) return null
  return BOLETO_STATUSES.includes(text as BoletoStatus) ? (text as BoletoStatus) : null
}

type InvoiceCreationBody = Record<string, unknown> & {
  serviceOrderId?: unknown
  serviceOrderIds?: unknown
  mode?: unknown
  createBoleto?: unknown
  boleto?: unknown
}

function buildInvoiceInputFromOrder(order: { total: number, items: Array<{ total: number | null }> }, body: InvoiceCreationBody) {
  const computedSubtotal = round2(order.items.reduce((sum, item) => sum + Number(item.total || 0), 0))
  const subtotal = round2(parseNumber(body.subtotal, computedSubtotal > 0 ? computedSubtotal : Number(order.total || 0)))
  const discount = round2(Math.max(parseNumber(body.discount, 0), 0))
  const interest = round2(Math.max(parseNumber(body.interest, 0), 0))
  const totalCalculated = round2(Math.max(subtotal - discount + interest, 0))
  const total = hasOwn(body, 'total')
    ? round2(Math.max(parseNumber(body.total, totalCalculated), 0))
    : totalCalculated

  const shouldCreateBoleto = Boolean(body.createBoleto || body.boleto)
  const invoiceStatus = parseInvoiceStatus(body.status) || (shouldCreateBoleto ? 'ISSUED' : 'DRAFT')

  return {
    code: nullableString(body.code),
    issueDate: parseDate(body.issueDate) || new Date(),
    dueDate: parseDate(body.dueDate),
    status: invoiceStatus,
    subtotal,
    discount,
    interest,
    total,
    notes: nullableString(body.notes),
    shouldCreateBoleto
  }
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const url = new URL(req.url)
  const invoiceStatus = parseInvoiceStatus(url.searchParams.get('status'))
  const boletoStatus = parseBoletoStatus(url.searchParams.get('boletoStatus'))
  const query = normalizeString(url.searchParams.get('q')).toLowerCase()

  const invoices = await prisma.serviceOrderInvoice.findMany({
    where: {
      companyId,
      ...(invoiceStatus ? { status: invoiceStatus } : {}),
      ...(boletoStatus
        ? {
            boleto: {
              is: {
                status: boletoStatus
              }
            }
          }
        : {})
    },
    include: {
      boleto: true,
      serviceOrder: {
        select: {
          id: true,
          title: true,
          status: true,
          customer: { select: { name: true } },
          responsibleEmployee: { select: { name: true } }
        }
      }
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
  })

  const filtered = !query
    ? invoices
    : invoices.filter(invoice => {
        const searchable = [
          invoice.code,
          invoice.id,
          invoice.serviceOrder?.title,
          invoice.serviceOrder?.customer?.name,
          invoice.serviceOrder?.responsibleEmployee?.name,
          invoice.boleto?.barcode,
          invoice.boleto?.digitableLine,
          invoice.boleto?.bankName
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(query)
      })

  return NextResponse.json(filtered)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = (await req.json()) as InvoiceCreationBody
  const mode = normalizeString(body.mode).toLowerCase() || 'single'

  if (mode === 'bulk') {
    const sourceIds = Array.isArray(body.serviceOrderIds) ? body.serviceOrderIds : []
    const serviceOrderIds = Array.from(new Set(sourceIds.map(id => normalizeString(id)).filter(Boolean)))

    if (serviceOrderIds.length === 0) {
      return NextResponse.json({ error: 'serviceOrderIds obrigatorio para geracao em massa' }, { status: 400 })
    }

    const skipExisting = body.skipExisting !== false
    const orders = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        id: { in: serviceOrderIds }
      },
      include: {
        items: { select: { total: true } },
        invoices: { select: { id: true } }
      }
    })

    const foundIds = new Set(orders.map(order => order.id))
    const missingIds = serviceOrderIds.filter(id => !foundIds.has(id))

    const created: string[] = []
    const skipped: Array<{ serviceOrderId: string, reason: string }> = []
    const failed: Array<{ serviceOrderId: string, error: string }> = []

    for (const order of orders) {
      try {
        if (skipExisting && order.invoices.length > 0) {
          skipped.push({ serviceOrderId: order.id, reason: 'already_has_invoice' })
          continue
        }

        const input = buildInvoiceInputFromOrder(order, body)
        const boletoPayload = body.boleto as Record<string, unknown> | undefined
        const boletoStatus = parseBoletoStatus(boletoPayload?.status) || 'PENDING'

        await prisma.serviceOrderInvoice.create({
          data: {
            companyId,
            serviceOrderId: order.id,
            code: input.code,
            issueDate: input.issueDate,
            dueDate: input.dueDate,
            status: input.status,
            subtotal: input.subtotal,
            discount: input.discount,
            interest: input.interest,
            total: input.total,
            notes: input.notes,
            boleto: input.shouldCreateBoleto
              ? {
                  create: {
                    companyId,
                    status: boletoStatus,
                    bankName: nullableString(boletoPayload?.bankName),
                    barcode: nullableString(boletoPayload?.barcode),
                    digitableLine: nullableString(boletoPayload?.digitableLine),
                    dueDate: parseDate(boletoPayload?.dueDate) || input.dueDate
                  }
                }
              : undefined
          }
        })

        created.push(order.id)
      } catch (error) {
        failed.push({
          serviceOrderId: order.id,
          error: error instanceof Error ? error.message : 'failed_to_create'
        })
      }
    }

    return NextResponse.json({
      mode: 'bulk',
      requested: serviceOrderIds.length,
      createdCount: created.length,
      skippedCount: skipped.length,
      missingCount: missingIds.length,
      failedCount: failed.length,
      created,
      skipped,
      missing: missingIds,
      failed
    })
  }

  const serviceOrderId = normalizeString(body.serviceOrderId)
  if (!serviceOrderId) {
    return NextResponse.json({ error: 'serviceOrderId obrigatorio' }, { status: 400 })
  }

  const order = await prisma.serviceOrder.findFirst({
    where: { id: serviceOrderId, companyId },
    include: {
      items: { select: { total: true } }
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })
  }

  const input = buildInvoiceInputFromOrder(order, body)
  const boletoPayload = body.boleto as Record<string, unknown> | undefined
  const boletoStatus = parseBoletoStatus(boletoPayload?.status) || 'PENDING'

  const invoice = await prisma.serviceOrderInvoice.create({
    data: {
      companyId,
      serviceOrderId: order.id,
      code: input.code,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: input.status,
      subtotal: input.subtotal,
      discount: input.discount,
      interest: input.interest,
      total: input.total,
      notes: input.notes,
      boleto: input.shouldCreateBoleto
        ? {
            create: {
              companyId,
              status: boletoStatus,
              bankName: nullableString(boletoPayload?.bankName),
              barcode: nullableString(boletoPayload?.barcode),
              digitableLine: nullableString(boletoPayload?.digitableLine),
              dueDate: parseDate(boletoPayload?.dueDate) || input.dueDate
            }
          }
        : undefined
    },
    include: {
      boleto: true,
      serviceOrder: {
        select: {
          id: true,
          title: true,
          status: true,
          customer: { select: { name: true } },
          responsibleEmployee: { select: { name: true } }
        }
      }
    }
  })

  return NextResponse.json(invoice)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = (await req.json()) as Record<string, unknown>
  const invoiceId = normalizeString(body.invoiceId)

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrderInvoice.findFirst({
    where: { id: invoiceId, companyId },
    include: { boleto: true }
  })

  if (!current) {
    return NextResponse.json({ error: 'Fatura nao encontrada' }, { status: 404 })
  }

  const nextSubtotal = hasOwn(body, 'subtotal')
    ? round2(Math.max(parseNumber(body.subtotal, current.subtotal), 0))
    : current.subtotal
  const nextDiscount = hasOwn(body, 'discount')
    ? round2(Math.max(parseNumber(body.discount, current.discount), 0))
    : current.discount
  const nextInterest = hasOwn(body, 'interest')
    ? round2(Math.max(parseNumber(body.interest, current.interest), 0))
    : current.interest
  const totalFromFields = round2(Math.max(nextSubtotal - nextDiscount + nextInterest, 0))
  const nextTotal = hasOwn(body, 'total')
    ? round2(Math.max(parseNumber(body.total, totalFromFields), 0))
    : totalFromFields

  const invoiceStatus = hasOwn(body, 'status') ? parseInvoiceStatus(body.status) : null
  const boletoData = body.boleto as Record<string, unknown> | undefined
  const parsedBoletoStatus = boletoData ? parseBoletoStatus(boletoData.status) : null

  const invoice = await prisma.serviceOrderInvoice.update({
    where: { id: current.id },
    data: {
      ...(hasOwn(body, 'code') ? { code: nullableString(body.code) } : {}),
      ...(hasOwn(body, 'issueDate') ? { issueDate: parseDate(body.issueDate) || current.issueDate } : {}),
      ...(hasOwn(body, 'dueDate') ? { dueDate: parseDate(body.dueDate) } : {}),
      ...(invoiceStatus ? { status: invoiceStatus } : {}),
      ...(hasOwn(body, 'notes') ? { notes: nullableString(body.notes) } : {}),
      ...(invoiceStatus === 'PAID' ? { paidAt: new Date() } : {}),
      ...(invoiceStatus && invoiceStatus !== 'PAID' && hasOwn(body, 'status') ? { paidAt: null } : {}),
      subtotal: nextSubtotal,
      discount: nextDiscount,
      interest: nextInterest,
      total: nextTotal,
      ...(boletoData
        ? {
            boleto: current.boleto
              ? {
                  update: {
                    ...(parsedBoletoStatus ? { status: parsedBoletoStatus } : {}),
                    ...(hasOwn(boletoData, 'bankName') ? { bankName: nullableString(boletoData.bankName) } : {}),
                    ...(hasOwn(boletoData, 'barcode') ? { barcode: nullableString(boletoData.barcode) } : {}),
                    ...(hasOwn(boletoData, 'digitableLine') ? { digitableLine: nullableString(boletoData.digitableLine) } : {}),
                    ...(hasOwn(boletoData, 'dueDate') ? { dueDate: parseDate(boletoData.dueDate) } : {}),
                    ...(parsedBoletoStatus === 'PAID' ? { paidAt: new Date() } : {}),
                    ...(hasOwn(boletoData, 'status') && parsedBoletoStatus && parsedBoletoStatus !== 'PAID' ? { paidAt: null } : {})
                  }
                }
              : {
                  create: {
                    companyId,
                    status: parsedBoletoStatus || 'PENDING',
                    bankName: nullableString(boletoData.bankName),
                    barcode: nullableString(boletoData.barcode),
                    digitableLine: nullableString(boletoData.digitableLine),
                    dueDate: parseDate(boletoData.dueDate) || parseDate(body.dueDate)
                  }
                }
          }
        : {})
    },
    include: {
      boleto: true,
      serviceOrder: {
        select: {
          id: true,
          title: true,
          status: true,
          customer: { select: { name: true } },
          responsibleEmployee: { select: { name: true } }
        }
      }
    }
  })

  return NextResponse.json(invoice)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = (await req.json()) as Record<string, unknown>
  const invoiceId = normalizeString(body.invoiceId)

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrderInvoice.findFirst({
    where: { id: invoiceId, companyId },
    include: { boleto: true }
  })

  if (!current) {
    return NextResponse.json({ error: 'Fatura nao encontrada' }, { status: 404 })
  }

  await prisma.$transaction(async tx => {
    if (current.boleto) {
      await tx.serviceOrderBoleto.delete({
        where: { id: current.boleto.id }
      })
    }

    await tx.serviceOrderInvoice.delete({
      where: { id: current.id }
    })
  })

  return NextResponse.json({ success: true, id: current.id })
}
