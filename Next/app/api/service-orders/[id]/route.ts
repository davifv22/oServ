import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Empresa nÃ£o identificada' }, { status: 401 })

  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, companyId },
    include: {
      customer: true,
      responsibleEmployee: true,
      comments: {
        include: {
          author: { select: { id: true, name: true, email: true } },
          mentions: { include: { user: { select: { id: true, name: true, email: true } } } }
        },
        orderBy: { createdAt: 'asc' }
      },
      auditLogs: {
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!order) return NextResponse.json({ error: 'OS nÃ£o encontrada' }, { status: 404 })

  return NextResponse.json(order)
}

