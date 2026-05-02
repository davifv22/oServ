import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getAuth(req: Request) {
  return { userId: req.headers.get('x-user-id') }
}

function parseTake(value: string | null) {
  if (!value) return 30
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return 30

  return Math.min(Math.max(Math.trunc(parsed), 1), 200)
}

type PatchBody = {
  id?: string
}

export async function GET(req: Request) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const take = parseTake(searchParams.get('take'))

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take
  })

  return NextResponse.json(notifications)
}

export async function PATCH(req: Request) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  let body: PatchBody = {}

  try {
    body = await req.json() as PatchBody
  } catch {
    body = {}
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId, readAt: null },
      data: { readAt: new Date() }
    })
  } else {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    })
  }

  const unread = await prisma.notification.count({
    where: { userId, readAt: null }
  })

  return NextResponse.json({ success: true, unread })
}
