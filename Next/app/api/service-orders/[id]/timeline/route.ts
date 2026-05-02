import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({ where: { id: params.id, companyId } })
  if (!order) return NextResponse.json({ error: 'OS nÃ£o encontrada' }, { status: 404 })

  const [comments, logs] = await Promise.all([
    prisma.serviceOrderComment.findMany({
      where: { serviceOrderId: params.id },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.serviceOrderAuditLog.findMany({
      where: { serviceOrderId: params.id },
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    })
  ])

  const timeline = [
    ...logs.map(log => ({
      id: log.id,
      type: 'audit',
      action: log.action,
      message: log.message,
      actor: log.actor,
      createdAt: log.createdAt,
      oldValue: log.oldValue,
      newValue: log.newValue
    })),
    ...comments.map(comment => ({
      id: comment.id,
      type: 'comment',
      message: comment.message,
      actor: comment.author,
      createdAt: comment.createdAt
    }))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return NextResponse.json(timeline)
}

