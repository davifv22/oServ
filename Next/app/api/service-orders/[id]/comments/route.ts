import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
function getAuth(req: Request) {
  return {
    companyId: req.headers.get('x-company-id'),
    userId: req.headers.get('x-user-id')
  }
}

function extractMentionTokens(message: string) {
  return Array.from(new Set((message.match(/@[\w.-]+/g) || []).map(token => token.replace('@', '').toLowerCase())))
}

async function getParticipants(orderId: string, actorUserId: string) {
  const [order, comments] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id: orderId },
      select: {
        responsibleEmployee: {
          select: {
            userId: true
          }
        }
      }
    }),
    prisma.serviceOrderComment.findMany({
      where: { serviceOrderId: orderId },
      select: {
        authorId: true,
        mentions: {
          select: {
            userId: true
          }
        }
      }
    })
  ])

  const users = new Set<string>()

  if (order?.responsibleEmployee?.userId) {
    users.add(order.responsibleEmployee.userId)
  }

  for (const comment of comments) {
    if (comment.authorId) users.add(comment.authorId)

    for (const mention of comment.mentions) {
      if (mention.userId) users.add(mention.userId)
    }
  }

  users.delete(actorUserId)

  return Array.from(users)
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { companyId } = getAuth(req)
  if (!companyId) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId }
  })

  if (!order) return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })

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
  if (!companyId || !userId) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const body = await req.json()
  const message = String(body.message || '').trim()
  if (!message) return NextResponse.json({ error: 'Comentario vazio' }, { status: 400 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId }
  })

  if (!order) return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })

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

  await prisma.serviceOrderAuditLog.create({
    data: {
      serviceOrderId: params.id,
      actorId: userId,
      action: 'COMMENTED',
      message: `Novo comentario na OS "${order.title}"`
    }
  })

  const participants = await getParticipants(params.id, userId)
  const mentionedUserIds = new Set(mentionedUsers.filter(user => user.id !== userId).map(user => user.id))

  const mentionNotificationData = Array.from(mentionedUserIds).map(notifiedUserId => ({
    userId: notifiedUserId,
    kind: 'MENTION' as const,
    title: 'Voce foi mencionado em uma OS',
    body: `Na OS "${order.title}": ${message}`
  }))

  const genericNotificationData = participants
    .filter(notifiedUserId => !mentionedUserIds.has(notifiedUserId))
    .map(notifiedUserId => ({
      userId: notifiedUserId,
      kind: 'SERVICE_ORDER_UPDATED' as const,
      title: 'Novo comentario na OS',
      body: `A OS "${order.title}" recebeu um novo comentario.`
    }))

  const notifications = [...mentionNotificationData, ...genericNotificationData]

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  return NextResponse.json(comment)
}

