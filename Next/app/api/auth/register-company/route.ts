import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()

  const { companyName, email, password, subdomain } = body

  const existing = await prisma.company.findUnique({ where: { subdomain } })

  if (existing) {
    return NextResponse.json({ error: 'Subdomínio já em uso' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  const company = await prisma.company.create({
    data: {
      name: companyName,
      email,
      subdomain,
      users: {
        create: {
          name: companyName,
          email,
          password: hashed,
          role: 'OWNER'
        }
      }
    }
  })

  return NextResponse.json({ success: true, subdomain: company.subdomain })
}
