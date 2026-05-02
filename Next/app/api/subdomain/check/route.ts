import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidSubdomain, sanitizeSubdomain } from '@/lib/tenant'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawSubdomain = searchParams.get('subdomain')
  const subdomain = sanitizeSubdomain(rawSubdomain || '')

  if (!subdomain || !isValidSubdomain(subdomain)) {
    return NextResponse.json({ available: false, exists: false, reason: 'invalid' })
  }

  const exists = await prisma.company.findUnique({
    where: { subdomain }
  })

  return NextResponse.json({ available: !exists, exists: Boolean(exists) })
}

