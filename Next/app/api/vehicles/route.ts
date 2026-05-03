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

function parseIntOrNull(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.floor(parsed)
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const vehicles = await prisma.vehicle.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(vehicles)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const plate = normalizeString(body.plate).toUpperCase()

  if (!plate) {
    return NextResponse.json({ error: 'Placa do veiculo e obrigatoria' }, { status: 400 })
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        companyId,
        plate,
        brand: nullableString(body.brand),
        model: nullableString(body.model),
        modelYear: parseIntOrNull(body.modelYear),
        color: nullableString(body.color),
        mileage: parseIntOrNull(body.mileage),
        notes: nullableString(body.notes)
      }
    })

    return NextResponse.json(vehicle)
  } catch {
    return NextResponse.json({ error: 'Nao foi possivel salvar o veiculo. Verifique se a placa ja existe.' }, { status: 409 })
  }
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const id = normalizeString(body.id)

  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  const plate = normalizeString(body.plate).toUpperCase()

  if (!plate) {
    return NextResponse.json({ error: 'Placa do veiculo e obrigatoria' }, { status: 400 })
  }

  try {
    const updated = await prisma.vehicle.updateMany({
      where: { id, companyId },
      data: {
        plate,
        brand: nullableString(body.brand),
        model: nullableString(body.model),
        modelYear: parseIntOrNull(body.modelYear),
        color: nullableString(body.color),
        mileage: parseIntOrNull(body.mileage),
        notes: nullableString(body.notes)
      }
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Nao foi possivel atualizar o veiculo. Verifique se a placa ja existe.' }, { status: 409 })
  }
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await prisma.vehicle.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}
