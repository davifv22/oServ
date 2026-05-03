import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const materials = await prisma.material.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(materials)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const name = normalizeString(body.name)

  if (!name) {
    return NextResponse.json({ error: 'Nome do material e obrigatorio' }, { status: 400 })
  }

  const material = await prisma.material.create({
    data: {
      companyId,
      name,
      unit: normalizeString(body.unit) || 'UN',
      unitPrice: parseNumber(body.unitPrice, 0)
    }
  })

  return NextResponse.json(material)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const body = await req.json()
  const id = normalizeString(body.id)

  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  const updated = await prisma.material.updateMany({
    where: { id, companyId },
    data: {
      name: normalizeString(body.name),
      unit: normalizeString(body.unit) || 'UN',
      unitPrice: parseNumber(body.unitPrice, 0)
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await prisma.material.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}
