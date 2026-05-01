import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getAuth(req: Request) {
  return { userId: req.headers.get('x-user-id') }
}

export async function GET(req: Request) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30
  })

  return NextResponse.json(notifications)
}

export async function PATCH(req: Request) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() }
  })

  return NextResponse.json({ success: true })
}
