import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const services = await prisma.service.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()

  const service = await prisma.service.create({
    data: {
      companyId,
      name: body.name,
      price: Number(body.price || 0)
    }
  })

  return NextResponse.json(service)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const service = await prisma.service.updateMany({
    where: { id: body.id, companyId },
    data: {
      name: body.name,
      price: Number(body.price || 0)
    }
  })

  return NextResponse.json(service)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await prisma.service.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}
