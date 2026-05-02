import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { removeImageByPublicPath, saveImageFile } from '@/lib/upload'

const prisma = new PrismaClient()

function getUserId(req: Request) {
  return req.headers.get('x-user-id')
}

const userSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  email: true,
  createdAt: true
}

export async function POST(req: Request) {
  const userId = getUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo de imagem obrigatorio' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const avatarUrl = await saveImageFile({
      file,
      ownerType: 'users',
      ownerId: userId,
      prefix: 'avatar'
    })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: userSelect
    })

    await removeImageByPublicPath(user.avatarUrl)

    return NextResponse.json(updated)
  } catch (error: any) {
    const message = error?.message || 'Nao foi possivel enviar a foto.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const userId = getUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: userSelect
  })

  await removeImageByPublicPath(user.avatarUrl)

  return NextResponse.json(updated)
}
