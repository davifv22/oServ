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
    where: { companyId }
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
      price: body.price
    }
  })

  return NextResponse.json(service)
}
