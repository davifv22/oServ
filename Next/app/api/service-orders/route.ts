import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function getUserId(req: Request) {
  return req.headers.get('x-user-id')
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  const userId = getUserId(req)

  if (!companyId) return NextResponse.json({ error: 'Empresa não identificada' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const current = await prisma.serviceOrder.findFirst({
    where: { id: body.id, companyId },
    include: { comments: true }
  })

  if (!current) return NextResponse.json({ error: 'OS não encontrada' }, { status: 404 })

  const order = await prisma.serviceOrder.update({
    where: { id: body.id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.title !== undefined ? { title: body.title } : {})
    }
  })

  if (body.status && body.status !== current.status) {
    await prisma.serviceOrderAuditLog.create({
      data: {
        serviceOrderId: current.id,
        actorId: userId || null,
        action: 'STATUS_CHANGED',
        field: 'status',
        oldValue: current.status,
        newValue: body.status,
        message: `Status alterado de ${current.status} para ${body.status}`
      }
    })

    const interactedUsers = await prisma.user.findMany({
      where: {
        companyId,
        OR: [
          { id: current.comments.map(c => c.authorId) }
        ]
      }
    })

    for (const user of interactedUsers) {
      if (user.id === userId) continue

      await prisma.notification.create({
        data: {
          userId: user.id,
          kind: 'SERVICE_ORDER_UPDATED',
          title: 'Atualização de OS',
          body: `A OS "${current.title}" mudou para ${body.status}`
        }
      })
    }
  }

  return NextResponse.json(order)
}
