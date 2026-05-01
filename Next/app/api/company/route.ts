import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

const companySelect = {
  id: true,
  name: true,
  tradeName: true,
  document: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  subdomain: true,
  createdAt: true
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: companySelect
  })

  if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  return NextResponse.json(company)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()

  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: body.name,
      tradeName: body.tradeName,
      document: body.document,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode
    },
    select: companySelect
  })

  return NextResponse.json(company)
}
