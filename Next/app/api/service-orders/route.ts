import { NextResponse } from 'next/server'
import { OrderItemType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function getUserId(req: Request) {
  return req.headers.get('x-user-id')
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

function valueToText(value: unknown) {
  if (value === null || value === undefined || value === '') return 'vazio'
  return String(value)
}

function parseItemType(value: unknown, serviceId: string | null, materialId: string | null) {
  const text = String(value || '').toUpperCase()

  if (text === 'SERVICE' || text === 'MATERIAL') {
    return text as OrderItemType
  }

  if (materialId) return 'MATERIAL'
  if (serviceId) return 'SERVICE'
  return 'SERVICE'
}

type NormalizedItem = {
  itemType: OrderItemType
  serviceId: string | null
  materialId: string | null
  description: string | null
  quantity: number
  unitPrice: number
  total: number
  sortOrder: number
}

type IncomingItem = {
  itemType?: string
  serviceId?: string | null
  materialId?: string | null
  description?: string | null
  quantity?: number | string
  unitPrice?: number | string
}

async function getOrderParticipants(orderId: string, actorUserId?: string | null) {
  const [order, comments] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id: orderId },
      select: {
        responsibleEmployee: {
          select: {
            userId: true
          }
        }
      }
    }),
    prisma.serviceOrderComment.findMany({
      where: { serviceOrderId: orderId },
      select: {
        authorId: true,
        mentions: {
          select: {
            userId: true
          }
        }
      }
    })
  ])

  const participants = new Set<string>()

  if (order?.responsibleEmployee?.userId) {
    participants.add(order.responsibleEmployee.userId)
  }

  for (const comment of comments) {
    if (comment.authorId) participants.add(comment.authorId)

    for (const mention of comment.mentions) {
      if (mention.userId) participants.add(mention.userId)
    }
  }

  if (actorUserId) {
    participants.delete(actorUserId)
  }

  return Array.from(participants)
}

async function buildItemsFromPayload(companyId: string, body: any): Promise<NormalizedItem[]> {
  const rawItems: IncomingItem[] = Array.isArray(body.items)
    ? body.items
    : []

  const orderTypeId = nullableString(body.orderTypeId)

  // If no items provided but orderTypeId is given, load items from order type
  if (rawItems.length === 0 && orderTypeId) {
    const orderType = await prisma.serviceOrderType.findFirst({
      where: { id: orderTypeId, companyId },
      include: {
        items: {
          include: {
            service: true,
            material: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (orderType?.items) {
      for (const typeItem of orderType.items) {
        rawItems.push({
          itemType: typeItem.itemType,
          serviceId: typeItem.serviceId,
          materialId: typeItem.materialId,
          description: typeItem.description,
          quantity: typeItem.quantity,
          unitPrice: typeItem.unitPrice
        })
      }
    }
  }

  const fallbackServiceId = nullableString(body.serviceId)
  if (rawItems.length === 0 && fallbackServiceId) {
    rawItems.push({ itemType: 'SERVICE', serviceId: fallbackServiceId, quantity: 1 })
  }

  if (rawItems.length === 0) {
    return []
  }

  const serviceIds = Array.from(new Set(rawItems.map(item => nullableString(item.serviceId)).filter(Boolean))) as string[]
  const materialIds = Array.from(new Set(rawItems.map(item => nullableString(item.materialId)).filter(Boolean))) as string[]

  const [services, materials] = await Promise.all([
    serviceIds.length > 0
      ? prisma.service.findMany({ where: { companyId, id: { in: serviceIds } } })
      : Promise.resolve([]),
    materialIds.length > 0
      ? prisma.material.findMany({ where: { companyId, id: { in: materialIds } } })
      : Promise.resolve([])
  ])

  const serviceMap = new Map(services.map(service => [service.id, service]))
  const materialMap = new Map(materials.map(material => [material.id, material]))

  const items: NormalizedItem[] = []

  for (let index = 0; index < rawItems.length; index += 1) {
    const rawItem = rawItems[index]
    const serviceId = nullableString(rawItem.serviceId)
    const materialId = nullableString(rawItem.materialId)

    const safeService = serviceId ? serviceMap.get(serviceId) || null : null
    const safeMaterial = materialId ? materialMap.get(materialId) || null : null

    const itemType = parseItemType(rawItem.itemType, safeService?.id || null, safeMaterial?.id || null)
    const quantity = Math.max(parseNumber(rawItem.quantity, 1), 0)

    if (quantity <= 0) continue

    const basePrice = itemType === 'MATERIAL'
      ? Number(safeMaterial?.unitPrice || 0)
      : Number(safeService?.price || 0)

    const rawUnitPrice = parseNumber(rawItem.unitPrice, Number.NaN)
    const unitPrice = Number.isFinite(rawUnitPrice) && rawUnitPrice >= 0 ? rawUnitPrice : basePrice

    const description = nullableString(rawItem.description)
      || safeService?.name
      || safeMaterial?.name
      || null

    if (!description && !safeService && !safeMaterial) {
      continue
    }

    const total = Number((quantity * unitPrice).toFixed(2))

    items.push({
      itemType,
      serviceId: safeService?.id || null,
      materialId: safeMaterial?.id || null,
      description,
      quantity,
      unitPrice,
      total,
      sortOrder: index
    })
  }

  return items
}

function calculateTotal(items: NormalizedItem[]) {
  return Number(items.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2))
}

function shouldReplaceItems(body: any) {
  return Array.isArray(body.items)
    || body.serviceId !== undefined
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const responsibleEmployeeId = searchParams.get('responsibleEmployeeId') || undefined

  const orders = await prisma.serviceOrder.findMany({
    where: {
      companyId,
      ...(status ? { status: status as any } : {}),
      ...(responsibleEmployeeId ? { responsibleEmployeeId } : {})
    },
    include: {
      customer: true,
      vehicle: true,
      orderType: true,
      responsibleEmployee: true,
      items: {
        include: {
          service: true,
          material: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      comments: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  const userId = getUserId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = await req.json()
  const title = normalizeString(body.title)

  if (!title) {
    return NextResponse.json({ error: 'Titulo da OS e obrigatorio' }, { status: 400 })
  }

  const orderTypeId = nullableString(body.orderTypeId)
  let defaultPriority = 'MEDIUM'

  if (orderTypeId) {
    const orderType = await prisma.serviceOrderType.findFirst({
      where: { id: orderTypeId, companyId },
      select: { defaultPriority: true }
    })
    if (orderType) {
      defaultPriority = orderType.defaultPriority
    }
  }

  let items: NormalizedItem[] = []
  try {
    items = await buildItemsFromPayload(companyId, body)
  } catch {
    return NextResponse.json({ error: 'Erro ao montar itens da OS' }, { status: 500 })
  }

  const hasItems = items.length > 0
  const explicitTotal = parseNumber(body.total, 0)
  const travelCost = Math.max(parseNumber(body.travelCost, 0), 0)
  const itemsBaseTotal = hasItems ? calculateTotal(items) : explicitTotal
  const total = Number((itemsBaseTotal + travelCost).toFixed(2))

  const order = await prisma.serviceOrder.create({
    data: {
      companyId,
      title,
      description: nullableString(body.description),
      customerId: nullableString(body.customerId),
      vehicleId: nullableString(body.vehicleId),
      orderTypeId: nullableString(body.orderTypeId),
      responsibleEmployeeId: nullableString(body.responsibleEmployeeId),
      priority: body.priority || defaultPriority,
      status: body.status || 'OPEN',
      travelCost,
      total,
      items: {
        create: items.map(item => ({
          itemType: item.itemType,
          serviceId: item.serviceId,
          materialId: item.materialId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sortOrder: item.sortOrder
        }))
      }
    },
    include: {
      customer: true,
      vehicle: true,
      orderType: true,
      responsibleEmployee: true,
      items: {
        include: {
          service: true,
          material: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      comments: { select: { id: true } }
    }
  })

  await prisma.serviceOrderAuditLog.create({
    data: {
      serviceOrderId: order.id,
      actorId: userId || null,
      action: 'CREATED',
      message: `OS criada: ${order.title}${order.items.length > 0 ? ` (${order.items.length} itens)` : ''}`
    }
  })

  if (order.responsibleEmployeeId) {
    const responsibleUser = await prisma.employee.findFirst({
      where: { id: order.responsibleEmployeeId, companyId },
      select: { userId: true }
    })

    if (responsibleUser?.userId && responsibleUser.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: responsibleUser.userId,
          kind: 'SERVICE_ORDER_ASSIGNED',
          title: 'Nova OS atribuida',
          body: `Voce recebeu a OS "${order.title}" como responsavel.`
        }
      })
    }
  }

  return NextResponse.json(order)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  const userId = getUserId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.id) {
    return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrder.findFirst({
    where: { id: body.id, companyId },
    include: {
      customer: true,
      vehicle: true,
      responsibleEmployee: true,
      items: true
    }
  })

  if (!current) {
    return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })
  }

  const replaceItems = shouldReplaceItems(body)
  let nextItems: NormalizedItem[] = []

  if (replaceItems) {
    try {
      nextItems = await buildItemsFromPayload(companyId, body)
    } catch {
      return NextResponse.json({ error: 'Erro ao montar itens da OS' }, { status: 500 })
    }
  }

  const nextData: Prisma.ServiceOrderUpdateInput = {
    ...(body.title !== undefined ? { title: normalizeString(body.title) } : {}),
    ...(body.description !== undefined ? { description: nullableString(body.description) } : {}),
    ...(body.customerId !== undefined ? { customerId: nullableString(body.customerId) } : {}),
    ...(body.vehicleId !== undefined ? { vehicleId: nullableString(body.vehicleId) } : {}),
    ...(body.responsibleEmployeeId !== undefined ? { responsibleEmployeeId: nullableString(body.responsibleEmployeeId) } : {}),
    ...(body.priority !== undefined ? { priority: body.priority } : {}),
    ...(body.status !== undefined ? { status: body.status } : {})
  }

  const hasTravelCostInput = body.travelCost !== undefined
  const nextTravelCost = hasTravelCostInput
    ? Math.max(parseNumber(body.travelCost, 0), 0)
    : Number(current.travelCost || 0)

  if (replaceItems) {
    nextData.total = Number((calculateTotal(nextItems) + nextTravelCost).toFixed(2))
    nextData.items = {
      deleteMany: {},
      create: nextItems.map(item => ({
        itemType: item.itemType,
        serviceId: item.serviceId,
        materialId: item.materialId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        sortOrder: item.sortOrder
      }))
    }
  } else if (body.total !== undefined) {
    const parsedTotal = parseNumber(body.total, 0)
    if (hasTravelCostInput) {
      nextData.total = Math.max(parsedTotal, 0)
    } else {
      nextData.total = parsedTotal
    }
  }

  if (hasTravelCostInput) {
    nextData.travelCost = nextTravelCost
    if (!replaceItems && body.total === undefined) {
      const currentSubtotal = Math.max(Number(current.total || 0) - Number(current.travelCost || 0), 0)
      nextData.total = Number((currentSubtotal + nextTravelCost).toFixed(2))
    }
  }

  const order = await prisma.serviceOrder.update({
    where: { id: body.id },
    data: nextData,
    include: {
      customer: true,
      vehicle: true,
      responsibleEmployee: true,
      items: {
        include: { service: true, material: true },
        orderBy: { sortOrder: 'asc' }
      },
      comments: { select: { id: true } }
    }
  })

  const participants = await getOrderParticipants(current.id, userId)

  const changedFields = [
    { field: 'title', label: 'titulo', before: current.title, after: body.title !== undefined ? normalizeString(body.title) : undefined },
    { field: 'description', label: 'descricao', before: current.description, after: body.description !== undefined ? nullableString(body.description) : undefined },
    { field: 'priority', label: 'prioridade', before: current.priority, after: body.priority },
    { field: 'status', label: 'status', before: current.status, after: body.status },
    { field: 'total', label: 'valor total', before: current.total, after: nextData.total ?? undefined },
    { field: 'travelCost', label: 'custo de deslocamento', before: current.travelCost, after: body.travelCost !== undefined ? Math.max(parseNumber(body.travelCost, 0), 0) : undefined },
    { field: 'customerId', label: 'cliente', before: current.customerId, after: body.customerId !== undefined ? nullableString(body.customerId) : undefined },
    { field: 'vehicleId', label: 'veiculo', before: current.vehicleId, after: body.vehicleId !== undefined ? nullableString(body.vehicleId) : undefined },
    { field: 'responsibleEmployeeId', label: 'responsavel', before: current.responsibleEmployeeId, after: body.responsibleEmployeeId !== undefined ? nullableString(body.responsibleEmployeeId) : undefined }
  ].filter(item => item.after !== undefined && valueToText(item.before) !== valueToText(item.after))

  if (replaceItems) {
    const previousItemsTotal = Number(current.items?.length || 0)
    const nextItemsTotal = Number(nextItems.length)
    if (previousItemsTotal !== nextItemsTotal) {
      changedFields.push({
        field: 'items',
        label: 'itens da OS',
        before: previousItemsTotal,
        after: nextItemsTotal
      })
    }
  }

  if (changedFields.length > 0) {
    await prisma.serviceOrderAuditLog.createMany({
      data: changedFields.map(item => ({
        serviceOrderId: current.id,
        actorId: userId || null,
        action: item.field === 'status' ? 'STATUS_CHANGED' : item.field === 'responsibleEmployeeId' ? 'ASSIGNED' : 'UPDATED',
        field: item.field,
        oldValue: valueToText(item.before),
        newValue: valueToText(item.after),
        message: item.field === 'status'
          ? `Status alterado de ${item.before} para ${item.after}`
          : `Campo ${item.label} atualizado`
      }))
    })

    if (participants.length > 0) {
      const changedNames = changedFields.map(item => item.label).join(', ')
      await prisma.notification.createMany({
        data: participants.map(notifiedUserId => ({
          userId: notifiedUserId,
          kind: 'SERVICE_ORDER_UPDATED',
          title: 'Atualizacao da OS',
          body: `A OS "${current.title}" teve alteracoes em: ${changedNames}.`
        }))
      })
    }
  }

  if (body.responsibleEmployeeId !== undefined && nullableString(body.responsibleEmployeeId) !== current.responsibleEmployeeId) {
    const newResponsible = nullableString(body.responsibleEmployeeId)
      ? await prisma.employee.findFirst({
        where: { id: nullableString(body.responsibleEmployeeId) || '', companyId },
        select: { userId: true }
      })
      : null

    if (newResponsible?.userId && newResponsible.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: newResponsible.userId,
          kind: 'SERVICE_ORDER_ASSIGNED',
          title: 'OS atribuida para voce',
          body: `Voce foi definido como responsavel pela OS "${current.title}".`
        }
      })
    }
  }

  return NextResponse.json(order)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
  }

  await prisma.serviceOrder.deleteMany({
    where: { id, companyId }
  })

  return NextResponse.json({ success: true })
}
