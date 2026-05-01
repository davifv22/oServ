import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subdomain = searchParams.get('subdomain')

  if (!subdomain) {
    return NextResponse.json({ available: false })
  }

  const exists = await prisma.company.findUnique({
    where: { subdomain }
  })

  return NextResponse.json({ available: !exists })
}
