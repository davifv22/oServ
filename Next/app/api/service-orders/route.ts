import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const orders = await prisma.serviceOrder.findMany({
    where: { companyId },
    include: { customer: true },
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
      customerId: body.customerId,
      priority: body.priority,
      total: body.total
    }
  })

  return NextResponse.json(order)
}
