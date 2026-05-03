import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function round2(value: number) {
  return Number(value.toFixed(2))
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId },
    select: { id: true }
  })

  if (!order) {
    return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })
  }

  const invoices = await prisma.serviceOrderInvoice.findMany({
    where: { serviceOrderId: order.id, companyId },
    include: {
      boleto: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(invoices)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId },
    include: {
      items: true
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })
  }

  const body = await req.json()

  const computedSubtotal = round2(order.items.reduce((sum, item) => sum + Number(item.total || 0), 0))
  const subtotal = round2(parseNumber(body.subtotal, computedSubtotal > 0 ? computedSubtotal : Number(order.total || 0)))
  const discount = round2(Math.max(parseNumber(body.discount, 0), 0))
  const interest = round2(Math.max(parseNumber(body.interest, 0), 0))
  const total = round2(Math.max(subtotal - discount + interest, 0))

  const shouldCreateBoleto = Boolean(body.createBoleto || body.boleto)
  const invoiceStatus = body.status || (shouldCreateBoleto ? 'ISSUED' : 'DRAFT')

  const invoice = await prisma.serviceOrderInvoice.create({
    data: {
      companyId,
      serviceOrderId: order.id,
      code: nullableString(body.code),
      issueDate: parseDate(body.issueDate) || new Date(),
      dueDate: parseDate(body.dueDate),
      status: invoiceStatus,
      subtotal,
      discount,
      interest,
      total,
      notes: nullableString(body.notes),
      boleto: shouldCreateBoleto
        ? {
          create: {
            companyId,
            status: body?.boleto?.status || 'PENDING',
            bankName: nullableString(body?.boleto?.bankName),
            barcode: nullableString(body?.boleto?.barcode),
            digitableLine: nullableString(body?.boleto?.digitableLine),
            dueDate: parseDate(body?.boleto?.dueDate) || parseDate(body.dueDate)
          }
        }
        : undefined
    },
    include: {
      boleto: true
    }
  })

  return NextResponse.json(invoice)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const invoiceId = normalizeString(body.invoiceId)

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrderInvoice.findFirst({
    where: { id: invoiceId, serviceOrderId: params.id, companyId },
    include: { boleto: true }
  })

  if (!current) {
    return NextResponse.json({ error: 'Fatura nao encontrada' }, { status: 404 })
  }

  const subtotal = body.subtotal !== undefined ? round2(Math.max(parseNumber(body.subtotal, current.subtotal), 0)) : current.subtotal
  const discount = body.discount !== undefined ? round2(Math.max(parseNumber(body.discount, current.discount), 0)) : current.discount
  const interest = body.interest !== undefined ? round2(Math.max(parseNumber(body.interest, current.interest), 0)) : current.interest
  const total = round2(Math.max(subtotal - discount + interest, 0))

  const invoice = await prisma.serviceOrderInvoice.update({
    where: { id: current.id },
    data: {
      ...(body.code !== undefined ? { code: nullableString(body.code) } : {}),
      ...(body.issueDate !== undefined ? { issueDate: parseDate(body.issueDate) || current.issueDate } : {}),
      ...(body.dueDate !== undefined ? { dueDate: parseDate(body.dueDate) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: nullableString(body.notes) } : {}),
      ...(body.status === 'PAID' ? { paidAt: new Date() } : {}),
      subtotal,
      discount,
      interest,
      total,
      ...(body.boleto
        ? {
          boleto: current.boleto
            ? {
              update: {
                ...(body.boleto.status !== undefined ? { status: body.boleto.status } : {}),
                ...(body.boleto.bankName !== undefined ? { bankName: nullableString(body.boleto.bankName) } : {}),
                ...(body.boleto.barcode !== undefined ? { barcode: nullableString(body.boleto.barcode) } : {}),
                ...(body.boleto.digitableLine !== undefined ? { digitableLine: nullableString(body.boleto.digitableLine) } : {}),
                ...(body.boleto.dueDate !== undefined ? { dueDate: parseDate(body.boleto.dueDate) } : {}),
                ...(body.boleto.status === 'PAID' ? { paidAt: new Date() } : {})
              }
            }
            : {
              create: {
                companyId,
                status: body.boleto.status || 'PENDING',
                bankName: nullableString(body.boleto.bankName),
                barcode: nullableString(body.boleto.barcode),
                digitableLine: nullableString(body.boleto.digitableLine),
                dueDate: parseDate(body.boleto.dueDate) || parseDate(body.dueDate)
              }
            }
        }
        : {})
    },
    include: {
      boleto: true
    }
  })

  return NextResponse.json(invoice)
}
