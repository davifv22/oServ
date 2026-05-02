import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
function getUserId(req: Request) {
  return req.headers.get('x-user-id')
}

export async function GET(req: Request) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o identificado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      createdAt: true
    }
  })

  if (!user) return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o identificado' }, { status: 401 })

  const body = await req.json()

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      email: body.email
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      createdAt: true
    }
  })

  return NextResponse.json(user)
}

