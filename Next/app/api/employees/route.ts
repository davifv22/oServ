import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(employees)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()

  const employee = await prisma.employee.create({
    data: {
      companyId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      position: body.position,
      hasAccess: Boolean(body.hasAccess)
    }
  })

  return NextResponse.json(employee)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()

  const employee = await prisma.employee.updateMany({
    where: { id: body.id, companyId },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      position: body.position,
      hasAccess: Boolean(body.hasAccess)
    }
  })

  return NextResponse.json(employee)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await prisma.employee.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}
