import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getAuth(req: Request) {
  return {
    companyId: req.headers.get('x-company-id'),
    userId: req.headers.get('x-user-id')
  }
}

function extractMentionTokens(message: string) {
  return Array.from(new Set((message.match(/@[\w.-]+/g) || []).map(token => token.replace('@', '').toLowerCase())))
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { companyId } = getAuth(req)
  if (!companyId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId }
  })

  if (!order) return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 })

  const comments = await prisma.serviceOrderComment.findMany({
    where: { serviceOrderId: params.id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      mentions: { include: { user: { select: { id: true, name: true, email: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json(comments)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { companyId, userId } = getAuth(req)
  if (!companyId || !userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const message = String(body.message || '').trim()
  if (!message) return NextResponse.json({ error: 'Comentário vazio' }, { status: 400 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId }
  })

  if (!order) return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 })

  const tokens = extractMentionTokens(message)

  const mentionedUsers = tokens.length
    ? await prisma.user.findMany({
        where: {
          companyId,
          OR: tokens.flatMap(token => [
            { email: { contains: token } },
            { name: { contains: token } }
          ])
        }
      })
    : []

  const comment = await prisma.serviceOrderComment.create({
    data: {
      serviceOrderId: params.id,
      authorId: userId,
      message,
      mentions: {
        create: mentionedUsers.map(user => ({ userId: user.id }))
      }
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      mentions: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  })

  if (mentionedUsers.length) {
    await prisma.notification.createMany({
      data: mentionedUsers
        .filter(user => user.id !== userId)
        .map(user => ({
          userId: user.id,
          kind: 'MENTION',
          title: 'Você foi mencionado em uma OS',
          body: message
        }))
    })
  }

  return NextResponse.json(comment)
}
