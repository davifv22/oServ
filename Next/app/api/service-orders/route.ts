import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

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
      responsibleEmployee: true,
      comments: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()

  const order = await prisma.serviceOrder.create({
    data: {
      companyId,
      title: body.title,
      description: body.description,
      customerId: body.customerId || null,
      responsibleEmployeeId: body.responsibleEmployeeId || null,
      priority: body.priority || 'MEDIUM',
      status: body.status || 'OPEN',
      total: Number(body.total || 0)
    },
    include: {
      customer: true,
      responsibleEmployee: true
    }
  })

  return NextResponse.json(order)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const current = await prisma.serviceOrder.findFirst({ where: { id: body.id, companyId } })
  if (!current) return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 })

  const order = await prisma.serviceOrder.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.customerId !== undefined ? { customerId: body.customerId || null } : {}),
      ...(body.responsibleEmployeeId !== undefined ? { responsibleEmployeeId: body.responsibleEmployeeId || null } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.total !== undefined ? { total: Number(body.total || 0) } : {})
    },
    include: {
      customer: true,
      responsibleEmployee: true,
      comments: { select: { id: true } }
    }
  })

  return NextResponse.json(order)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await prisma.serviceOrder.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}
