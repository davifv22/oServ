import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const customers = await prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const body = await req.json()

  const customer = await prisma.customer.create({
    data: {
      companyId,
      name: body.name,
      document: body.document,
      email: body.email,
      phone: body.phone
    }
  })

  return NextResponse.json(customer)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID obrigatÃ³rio' }, { status: 400 })

  const updated = await prisma.customer.updateMany({
    where: { id: body.id, companyId },
    data: {
      name: body.name,
      document: body.document,
      email: body.email,
      phone: body.phone
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatÃ³rio' }, { status: 400 })

  await prisma.customer.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}

