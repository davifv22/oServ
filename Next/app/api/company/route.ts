import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      email: true,
      subdomain: true,
      createdAt: true
    }
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
      email: body.email
    },
    select: {
      id: true,
      name: true,
      email: true,
      subdomain: true,
      createdAt: true
    }
  })

  return NextResponse.json(company)
}
