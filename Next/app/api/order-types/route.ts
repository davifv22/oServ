import { NextResponse } from 'next/server'
import { OrderItemType, Priority } from '@prisma/client'
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

function parsePriority(value: unknown) {
  const text = String(value || '').toUpperCase()
  if (text === 'LOW' || text === 'MEDIUM' || text === 'HIGH' || text === 'URGENT') return text as Priority
  return 'MEDIUM'
}

function parseItemType(value: unknown, hasService: boolean, hasMaterial: boolean) {
  const text = String(value || '').toUpperCase()
  if (text === 'SERVICE' || text === 'MATERIAL') return text as OrderItemType
  if (hasMaterial) return 'MATERIAL'
  if (hasService) return 'SERVICE'
  return 'SERVICE'
}

type NormalizedTypeItem = {
  itemType: OrderItemType
  serviceId: string | null
  materialId: string | null
  description: string | null
  quantity: number
  unitPrice: number
  total: number
  sortOrder: number
}

async function normalizeTypeItems(companyId: string, rawItems: any[]) {
  const list = Array.isArray(rawItems) ? rawItems : []
  if (list.length === 0) return [] as NormalizedTypeItem[]

  const serviceIds = Array.from(new Set(list.map(item => nullableString(item?.serviceId)).filter(Boolean))) as string[]
  const materialIds = Array.from(new Set(list.map(item => nullableString(item?.materialId)).filter(Boolean))) as string[]

  const [services, materials] = await Promise.all([
    serviceIds.length > 0
      ? prisma.service.findMany({ where: { companyId, id: { in: serviceIds } } })
      : Promise.resolve([]),
    materialIds.length > 0
      ? prisma.material.findMany({ where: { companyId, id: { in: materialIds } } })
      : Promise.resolve([])
  ])

  const serviceMap = new Map(services.map(item => [item.id, item]))
  const materialMap = new Map(materials.map(item => [item.id, item]))

  const normalized: NormalizedTypeItem[] = []

  for (let index = 0; index < list.length; index += 1) {
    const rawItem = list[index]
    const serviceId = nullableString(rawItem?.serviceId)
    const materialId = nullableString(rawItem?.materialId)

    const service = serviceId ? serviceMap.get(serviceId) || null : null
    const material = materialId ? materialMap.get(materialId) || null : null

    const itemType = parseItemType(rawItem?.itemType, Boolean(service), Boolean(material))
    const quantity = Math.max(parseNumber(rawItem?.quantity, 1), 0)
    if (quantity <= 0) continue

    const basePrice = itemType === 'MATERIAL' ? Number(material?.unitPrice || 0) : Number(service?.price || 0)
    const inputPrice = parseNumber(rawItem?.unitPrice, Number.NaN)
    const unitPrice = Number.isFinite(inputPrice) && inputPrice >= 0 ? inputPrice : basePrice

    const description = nullableString(rawItem?.description)
      || service?.name
      || material?.name
      || null

    if (!description && !service && !material) continue

    normalized.push({
      itemType,
      serviceId: service?.id || null,
      materialId: material?.id || null,
      description,
      quantity,
      unitPrice,
      total: Number((quantity * unitPrice).toFixed(2)),
      sortOrder: index
    })
  }

  return normalized
}

const DEFAULT_ORDER_TYPES = [
  { name: 'Revisao Preventiva', description: 'Checklist geral, troca de itens periodicos e inspecao completa.', defaultPriority: 'MEDIUM' as Priority },
  { name: 'Freios e Suspensao', description: 'Diagnostico e manutencao do sistema de freio e suspensao.', defaultPriority: 'HIGH' as Priority },
  { name: 'Motor e Injecao', description: 'Analise de desempenho, injetores, velas e ignicao.', defaultPriority: 'HIGH' as Priority },
  { name: 'Troca de Oleo e Filtros', description: 'Troca de oleo, filtro de oleo, ar e combustivel.', defaultPriority: 'LOW' as Priority },
  { name: 'Alinhamento e Balanceamento', description: 'Correcao de alinhamento, caster/camber e balanceamento.', defaultPriority: 'MEDIUM' as Priority },
  { name: 'Eletrica Automotiva', description: 'Bateria, alternador, motor de partida e chicote eletrico.', defaultPriority: 'MEDIUM' as Priority },
  { name: 'Ar Condicionado', description: 'Carga de gas, vazamentos e manutencao do sistema de climatizacao.', defaultPriority: 'MEDIUM' as Priority },
  { name: 'Atendimento Emergencial', description: 'Servico prioritario para panes e reparos urgentes.', defaultPriority: 'URGENT' as Priority }
]

async function ensureDefaultOrderTypes(companyId: string) {
  const count = await prisma.serviceOrderType.count({ where: { companyId } })
  if (count > 0) return

  await prisma.serviceOrderType.createMany({
    data: DEFAULT_ORDER_TYPES.map(item => ({
      companyId,
      name: item.name,
      description: item.description,
      defaultPriority: item.defaultPriority
    }))
  })
}

function includesRelations() {
  return {
    items: {
      include: {
        service: true,
        material: true
      },
      orderBy: { sortOrder: 'asc' as const }
    }
  }
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  await ensureDefaultOrderTypes(companyId)

  const orderTypes = await prisma.serviceOrderType.findMany({
    where: { companyId },
    include: includesRelations(),
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(orderTypes)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const name = normalizeString(body.name)

  if (!name) {
    return NextResponse.json({ error: 'Nome do tipo de OS e obrigatorio' }, { status: 400 })
  }

  const items = await normalizeTypeItems(companyId, body.items)
  if (items.length === 0) {
    return NextResponse.json({ error: 'Adicione ao menos um item no tipo de OS' }, { status: 400 })
  }
  const created = await prisma.serviceOrderType.create({
    data: {
      companyId,
      name,
      description: nullableString(body.description),
      defaultPriority: parsePriority(body.defaultPriority),
      items: {
        create: items
      }
    },
    include: includesRelations()
  })

  return NextResponse.json(created)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const id = normalizeString(body.id)

  if (!id) {
    return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrderType.findFirst({
    where: { id, companyId }
  })

  if (!current) {
    return NextResponse.json({ error: 'Tipo de OS nao encontrado' }, { status: 404 })
  }

  const replaceItems = Array.isArray(body.items)
  const items = replaceItems ? await normalizeTypeItems(companyId, body.items) : []
  if (replaceItems && items.length === 0) {
    return NextResponse.json({ error: 'Adicione ao menos um item no tipo de OS' }, { status: 400 })
  }
  const updated = await prisma.$transaction(async tx => {
    await tx.serviceOrderType.update({
      where: { id: current.id },
      data: {
        ...(body.name !== undefined ? { name: normalizeString(body.name) } : {}),
        ...(body.description !== undefined ? { description: nullableString(body.description) } : {}),
        ...(body.defaultPriority !== undefined ? { defaultPriority: parsePriority(body.defaultPriority) } : {}),
        ...(replaceItems
          ? {
              items: {
                deleteMany: {},
                create: items
              }
            }
          : {})
      }
    })

    return tx.serviceOrderType.findUnique({
      where: { id: current.id },
      include: includesRelations()
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = normalizeString(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  const current = await prisma.serviceOrderType.findFirst({
    where: { id, companyId }
  })

  if (!current) {
    return NextResponse.json({ error: 'Tipo de OS nao encontrado' }, { status: 404 })
  }

  await prisma.$transaction(async tx => {
    await tx.serviceOrderTypeItem.deleteMany({ where: { orderTypeId: current.id } })
    await tx.serviceOrderType.delete({ where: { id: current.id } })
  })

  return NextResponse.json({ success: true })
}
