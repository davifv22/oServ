import { BoletoStatus, CompanyPlan, InvoiceStatus, Priority, ServiceOrderStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STATUS_ORDER: ServiceOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'FINISHED', 'CANCELED']
const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const ACTIVE_STATUSES: ServiceOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER']
const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED']
const BOLETO_STATUS_ORDER: BoletoStatus[] = ['PENDING', 'PAID', 'EXPIRED', 'CANCELED']
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

function invoiceStatusLabel(status: InvoiceStatus) {
  if (status === 'DRAFT') return 'Rascunho'
  if (status === 'ISSUED') return 'Emitida'
  if (status === 'PAID') return 'Paga'
  if (status === 'OVERDUE') return 'Vencida'
  if (status === 'CANCELED') return 'Cancelada'
  return status
}

function boletoStatusLabel(status: BoletoStatus) {
  if (status === 'PENDING') return 'Pendente'
  if (status === 'PAID') return 'Pago'
  if (status === 'EXPIRED') return 'Expirado'
  if (status === 'CANCELED') return 'Cancelado'
  return status
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
    pipelineOrders,
    invoiceSnapshot
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
    }),
    prisma.serviceOrderInvoice.findMany({
      where: { companyId },
      select: {
        status: true,
        total: true,
        boleto: {
          select: {
            status: true
          }
        }
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

  const invoiceStatusCountMap = new Map<InvoiceStatus, number>()
  const invoiceStatusAmountMap = new Map<InvoiceStatus, number>()
  const boletoStatusCountMap = new Map<BoletoStatus, number>()
  const boletoStatusAmountMap = new Map<BoletoStatus, number>()

  let invoicesAmountTotal = 0
  let invoicesAmountPaid = 0
  let invoicesAmountOpen = 0

  for (const invoice of invoiceSnapshot) {
    const invoiceStatus = invoice.status
    const total = Number(invoice.total || 0)

    invoicesAmountTotal += total

    invoiceStatusCountMap.set(invoiceStatus, (invoiceStatusCountMap.get(invoiceStatus) || 0) + 1)
    invoiceStatusAmountMap.set(invoiceStatus, (invoiceStatusAmountMap.get(invoiceStatus) || 0) + total)

    if (invoiceStatus === 'PAID') {
      invoicesAmountPaid += total
    }

    if (invoiceStatus === 'DRAFT' || invoiceStatus === 'ISSUED' || invoiceStatus === 'OVERDUE') {
      invoicesAmountOpen += total
    }

    if (invoice.boleto?.status) {
      const boletoStatus = invoice.boleto.status
      boletoStatusCountMap.set(boletoStatus, (boletoStatusCountMap.get(boletoStatus) || 0) + 1)
      boletoStatusAmountMap.set(boletoStatus, (boletoStatusAmountMap.get(boletoStatus) || 0) + total)
    }
  }

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
      averageTicket,
      invoicesTotal: invoiceSnapshot.length,
      invoicesPaidCount: invoiceStatusCountMap.get('PAID') || 0,
      invoicesOpenCount: (invoiceStatusCountMap.get('DRAFT') || 0) + (invoiceStatusCountMap.get('ISSUED') || 0) + (invoiceStatusCountMap.get('OVERDUE') || 0),
      invoicesOverdueCount: invoiceStatusCountMap.get('OVERDUE') || 0,
      invoicesCanceledCount: invoiceStatusCountMap.get('CANCELED') || 0,
      invoicesAmountTotal,
      invoicesAmountPaid,
      invoicesAmountOpen,
      boletosTotal: BOLETO_STATUS_ORDER.reduce((sum, status) => sum + (boletoStatusCountMap.get(status) || 0), 0),
      boletosPending: boletoStatusCountMap.get('PENDING') || 0,
      boletosPaid: boletoStatusCountMap.get('PAID') || 0,
      boletosExpired: boletoStatusCountMap.get('EXPIRED') || 0,
      boletosCanceled: boletoStatusCountMap.get('CANCELED') || 0,
      boletosAmountPending: Number((boletoStatusAmountMap.get('PENDING') || 0).toFixed(2)),
      boletosAmountPaid: Number((boletoStatusAmountMap.get('PAID') || 0).toFixed(2))
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
      })),
      invoiceByStatus: INVOICE_STATUS_ORDER.map(status => ({
        status,
        label: invoiceStatusLabel(status),
        total: invoiceStatusCountMap.get(status) || 0,
        amount: Number((invoiceStatusAmountMap.get(status) || 0).toFixed(2))
      })),
      boletoByStatus: BOLETO_STATUS_ORDER.map(status => ({
        status,
        label: boletoStatusLabel(status),
        total: boletoStatusCountMap.get(status) || 0,
        amount: Number((boletoStatusAmountMap.get(status) || 0).toFixed(2))
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
