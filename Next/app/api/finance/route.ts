import { CompanyPlan, Priority, PrismaClient, ServiceOrderStatus } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

const STATUS_ORDER: ServiceOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'FINISHED', 'CANCELED']
const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const ACTIVE_STATUSES: ServiceOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER']
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function monthKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

function monthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`
}

function statusLabel(status: ServiceOrderStatus) {
  if (status === 'OPEN') return 'Aberta'
  if (status === 'IN_PROGRESS') return 'Em andamento'
  if (status === 'WAITING_CUSTOMER') return 'Aguardando cliente'
  if (status === 'FINISHED') return 'Finalizada'
  if (status === 'CANCELED') return 'Cancelada'
  return status
}

function priorityLabel(priority: Priority) {
  if (priority === 'LOW') return 'Baixa'
  if (priority === 'MEDIUM') return 'Media'
  if (priority === 'HIGH') return 'Alta'
  if (priority === 'URGENT') return 'Urgente'
  return priority
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthsStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const monthBuckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(monthsStart.getFullYear(), monthsStart.getMonth() + index, 1)
    return {
      key: monthKey(date),
      month: monthLabel(date),
      opened: 0,
      finished: 0,
      revenue: 0
    }
  })

  const monthBucketMap = new Map(monthBuckets.map(item => [item.key, item]))

  const [
    company,
    statusAgg,
    priorityPipelineAgg,
    finishedTotals,
    finishedThisMonthTotals,
    finishedPreviousMonthTotals,
    monthlyOrders,
    topCustomersAgg,
    customerNames,
    recentTransactions,
    pipelineOrders
  ] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        tradeName: true,
        plan: true
      }
    }),
    prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true },
      _sum: { total: true }
    }),
    prisma.serviceOrder.groupBy({
      by: ['priority'],
      where: {
        companyId,
        status: { in: ACTIVE_STATUSES }
      },
      _count: { _all: true },
      _sum: { total: true }
    }),
    prisma.serviceOrder.aggregate({
      where: { companyId, status: 'FINISHED' },
      _sum: { total: true },
      _avg: { total: true },
      _count: { _all: true }
    }),
    prisma.serviceOrder.aggregate({
      where: {
        companyId,
        status: 'FINISHED',
        updatedAt: { gte: thisMonthStart }
      },
      _sum: { total: true }
    }),
    prisma.serviceOrder.aggregate({
      where: {
        companyId,
        status: 'FINISHED',
        updatedAt: {
          gte: previousMonthStart,
          lt: thisMonthStart
        }
      },
      _sum: { total: true }
    }),
    prisma.serviceOrder.findMany({
      where: {
        companyId,
        OR: [
          { createdAt: { gte: monthsStart } },
          { updatedAt: { gte: monthsStart } }
        ]
      },
      select: {
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.serviceOrder.groupBy({
      by: ['customerId'],
      where: {
        companyId,
        status: 'FINISHED',
        customerId: { not: null }
      },
      _count: { _all: true },
      _sum: { total: true }
    }),
    prisma.customer.findMany({
      where: { companyId },
      select: { id: true, name: true }
    }),
    prisma.serviceOrder.findMany({
      where: {
        companyId,
        status: 'FINISHED'
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        total: true,
        updatedAt: true,
        customer: { select: { name: true } },
        responsibleEmployee: { select: { name: true } }
      }
    }),
    prisma.serviceOrder.findMany({
      where: {
        companyId,
        status: { in: ACTIVE_STATUSES }
      },
      orderBy: { total: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        total: true,
        status: true,
        updatedAt: true,
        customer: { select: { name: true } },
        responsibleEmployee: { select: { name: true } }
      }
    })
  ])

  const statusCountMap = new Map<ServiceOrderStatus, number>(statusAgg.map(item => [item.status, item._count._all]))
  const statusRevenueMap = new Map<ServiceOrderStatus, number>(statusAgg.map(item => [item.status, Number(item._sum.total || 0)]))
  const priorityCountMap = new Map<Priority, number>(priorityPipelineAgg.map(item => [item.priority, item._count._all]))
  const priorityRevenueMap = new Map<Priority, number>(priorityPipelineAgg.map(item => [item.priority, Number(item._sum.total || 0)]))

  for (const order of monthlyOrders) {
    const openKey = monthKey(order.createdAt)
    const openBucket = monthBucketMap.get(openKey)
    if (openBucket) openBucket.opened += 1

    if (order.status === 'FINISHED') {
      const finishedKey = monthKey(order.updatedAt)
      const finishedBucket = monthBucketMap.get(finishedKey)
      if (finishedBucket) {
        finishedBucket.finished += 1
        finishedBucket.revenue += Number(order.total || 0)
      }
    }
  }

  const customerNameMap = new Map(customerNames.map(customer => [customer.id, customer.name]))

  const topCustomers = topCustomersAgg
    .map(item => ({
      customerId: item.customerId || '',
      name: customerNameMap.get(item.customerId || '') || 'Sem cliente',
      orders: item._count._all,
      revenue: Number(item._sum.total || 0)
    }))
    .sort((a, b) => (b.revenue - a.revenue) || (b.orders - a.orders))
    .slice(0, 6)

  const totalOrders = STATUS_ORDER.reduce((sum, status) => sum + (statusCountMap.get(status) || 0), 0)
  const finishedOrders = statusCountMap.get('FINISHED') || 0
  const canceledOrders = statusCountMap.get('CANCELED') || 0
  const activeOrders = ACTIVE_STATUSES.reduce((sum, status) => sum + (statusCountMap.get(status) || 0), 0)

  const totalRevenue = Number(finishedTotals._sum.total || 0)
  const thisMonthRevenue = Number(finishedThisMonthTotals._sum.total || 0)
  const previousMonthRevenue = Number(finishedPreviousMonthTotals._sum.total || 0)
  const pipelineRevenue = ACTIVE_STATUSES.reduce((sum, status) => sum + (statusRevenueMap.get(status) || 0), 0)
  const canceledRevenue = Number(statusRevenueMap.get('CANCELED') || 0)
  const averageTicket = Number(finishedTotals._avg.total || 0)

  const monthGrowthPercent = previousMonthRevenue > 0
    ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : (thisMonthRevenue > 0 ? 100 : 0)

  const conversionRate = totalOrders > 0 ? (finishedOrders / totalOrders) * 100 : 0

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    company: company
      ? {
          id: company.id,
          name: company.name,
          tradeName: company.tradeName,
          plan: company.plan as CompanyPlan
        }
      : null,
    summary: {
      totalOrders,
      finishedOrders,
      activeOrders,
      canceledOrders,
      conversionRate,
      totalRevenue,
      thisMonthRevenue,
      previousMonthRevenue,
      monthGrowthPercent,
      pipelineRevenue,
      canceledRevenue,
      averageTicket
    },
    charts: {
      monthly: monthBuckets,
      byStatus: STATUS_ORDER.map(status => ({
        status,
        label: statusLabel(status),
        orders: statusCountMap.get(status) || 0,
        revenue: statusRevenueMap.get(status) || 0
      })),
      pipelineByPriority: PRIORITY_ORDER.map(priority => ({
        priority,
        label: priorityLabel(priority),
        orders: priorityCountMap.get(priority) || 0,
        revenue: priorityRevenueMap.get(priority) || 0
      }))
    },
    topCustomers,
    recentTransactions: recentTransactions.map(order => ({
      id: order.id,
      title: order.title,
      total: Number(order.total || 0),
      updatedAt: order.updatedAt,
      customerName: order.customer?.name || 'Sem cliente',
      responsibleName: order.responsibleEmployee?.name || 'Sem responsavel'
    })),
    pipelineOrders: pipelineOrders.map(order => ({
      id: order.id,
      title: order.title,
      total: Number(order.total || 0),
      status: order.status,
      updatedAt: order.updatedAt,
      customerName: order.customer?.name || 'Sem cliente',
      responsibleName: order.responsibleEmployee?.name || 'Sem responsavel'
    }))
  })
}
