import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function getUserId(req: Request) {
  return req.headers.get('x-user-id')
}

function valueToText(value: unknown) {
  if (value === null || value === undefined || value === '') return 'vazio'
  return String(value)
}

async function getOrderParticipants(orderId: string, actorUserId?: string | null) {
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

  const participants = new Set<string>()

  if (order?.responsibleEmployee?.userId) {
    participants.add(order.responsibleEmployee.userId)
  }

  for (const comment of comments) {
    if (comment.authorId) participants.add(comment.authorId)

    for (const mention of comment.mentions) {
      if (mention.userId) participants.add(mention.userId)
    }
  }

  if (actorUserId) {
    participants.delete(actorUserId)
  }

  return Array.from(participants)
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const responsibleEmployeeId = searchParams.get('responsibleEmployeeId') || undefined

  const orders = await prisma.serviceOrder.findMany({
    where: {
      companyId,
      ...(status ? { status: status as any } : {}),
      ...(responsibleEmployeeId ? { responsibleEmployeeId } : {})
    },
    include: {
      customer: true,
      responsibleEmployee: true,
      comments: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  const userId = getUserId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = await req.json()

  const order = await prisma.serviceOrder.create({
    data: {
      companyId,
      title: body.title,
      description: body.description || null,
      customerId: body.customerId || null,
      responsibleEmployeeId: body.responsibleEmployeeId || null,
      priority: body.priority || 'MEDIUM',
      status: body.status || 'OPEN',
      total: Number(body.total || 0)
    },
    include: {
      customer: true,
      responsibleEmployee: true,
      comments: { select: { id: true } }
    }
  })

  await prisma.serviceOrderAuditLog.create({
    data: {
      serviceOrderId: order.id,
      actorId: userId || null,
      action: 'CREATED',
      message: `OS criada: ${order.title}`
    }
  })

  if (order.responsibleEmployeeId) {
    const responsibleUser = await prisma.employee.findFirst({
      where: { id: order.responsibleEmployeeId, companyId },
      select: { userId: true, name: true }
    })

    if (responsibleUser?.userId && responsibleUser.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: responsibleUser.userId,
          kind: 'SERVICE_ORDER_ASSIGNED',
          title: 'Nova OS atribuida',
          body: `Voce recebeu a OS "${order.title}" como responsavel.`
        }
      })
    }
  }

  return NextResponse.json(order)
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  const userId = getUserId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.id) {
    return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
  }

  const current = await prisma.serviceOrder.findFirst({
    where: { id: body.id, companyId },
    include: {
      customer: true,
      responsibleEmployee: true
    }
  })

  if (!current) {
    return NextResponse.json({ error: 'OS nao encontrada' }, { status: 404 })
  }

  const nextData = {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined ? { description: body.description || null } : {}),
    ...(body.customerId !== undefined ? { customerId: body.customerId || null } : {}),
    ...(body.responsibleEmployeeId !== undefined ? { responsibleEmployeeId: body.responsibleEmployeeId || null } : {}),
    ...(body.priority !== undefined ? { priority: body.priority } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.total !== undefined ? { total: Number(body.total || 0) } : {})
  }

  const order = await prisma.serviceOrder.update({
    where: { id: body.id },
    data: nextData,
    include: {
      customer: true,
      responsibleEmployee: true,
      comments: { select: { id: true } }
    }
  })

  const participants = await getOrderParticipants(current.id, userId)

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

    if (participants.length > 0) {
      await prisma.notification.createMany({
        data: participants.map(notifiedUserId => ({
          userId: notifiedUserId,
          kind: 'SERVICE_ORDER_UPDATED',
          title: 'Status da OS atualizado',
          body: `A OS "${current.title}" mudou de ${current.status} para ${body.status}.`
        }))
      })
    }
  }

  const changedFields = [
    { field: 'title', label: 'titulo', before: current.title, after: body.title },
    { field: 'description', label: 'descricao', before: current.description, after: body.description },
    { field: 'priority', label: 'prioridade', before: current.priority, after: body.priority },
    { field: 'total', label: 'valor total', before: current.total, after: body.total },
    { field: 'customerId', label: 'cliente', before: current.customerId, after: body.customerId },
    { field: 'responsibleEmployeeId', label: 'responsavel', before: current.responsibleEmployeeId, after: body.responsibleEmployeeId }
  ].filter(item => item.after !== undefined && valueToText(item.before) !== valueToText(item.after))

  const nonStatusChanges = changedFields.filter(item => item.field !== 'responsibleEmployeeId')

  if (nonStatusChanges.length > 0) {
    await prisma.serviceOrderAuditLog.createMany({
      data: nonStatusChanges.map(item => ({
        serviceOrderId: current.id,
        actorId: userId || null,
        action: 'UPDATED',
        field: item.field,
        oldValue: valueToText(item.before),
        newValue: valueToText(item.after),
        message: `Campo ${item.label} atualizado`
      }))
    })

    if (participants.length > 0) {
      const changedNames = nonStatusChanges.map(item => item.label).join(', ')

      await prisma.notification.createMany({
        data: participants.map(notifiedUserId => ({
          userId: notifiedUserId,
          kind: 'SERVICE_ORDER_UPDATED',
          title: 'Atualizacao da OS',
          body: `A OS "${current.title}" teve alteracoes em: ${changedNames}.`
        }))
      })
    }
  }

  if (body.responsibleEmployeeId !== undefined && body.responsibleEmployeeId !== current.responsibleEmployeeId) {
    const [oldResponsible, newResponsible] = await Promise.all([
      current.responsibleEmployeeId
        ? prisma.employee.findFirst({
            where: { id: current.responsibleEmployeeId, companyId },
            select: { name: true }
          })
        : Promise.resolve(null),
      body.responsibleEmployeeId
        ? prisma.employee.findFirst({
            where: { id: body.responsibleEmployeeId, companyId },
            select: { name: true, userId: true }
          })
        : Promise.resolve(null)
    ])

    await prisma.serviceOrderAuditLog.create({
      data: {
        serviceOrderId: current.id,
        actorId: userId || null,
        action: 'ASSIGNED',
        field: 'responsibleEmployeeId',
        oldValue: oldResponsible?.name || 'Sem responsavel',
        newValue: newResponsible?.name || 'Sem responsavel',
        message: `Responsavel alterado para ${newResponsible?.name || 'Sem responsavel'}`
      }
    })

    if (newResponsible?.userId && newResponsible.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: newResponsible.userId,
          kind: 'SERVICE_ORDER_ASSIGNED',
          title: 'OS atribuida para voce',
          body: `Voce foi definido como responsavel pela OS "${current.title}".`
        }
      })
    }

    if (participants.length > 0) {
      await prisma.notification.createMany({
        data: participants.map(notifiedUserId => ({
          userId: notifiedUserId,
          kind: 'SERVICE_ORDER_UPDATED',
          title: 'Responsavel da OS atualizado',
          body: `A OS "${current.title}" agora esta com ${newResponsible?.name || 'Sem responsavel'}.`
        }))
      })
    }
  }

  return NextResponse.json(order)
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)

  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
  }

  await prisma.serviceOrder.deleteMany({
    where: { id, companyId }
  })

  return NextResponse.json({ success: true })
}

