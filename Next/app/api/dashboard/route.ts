import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BoletoStatus, InvoiceStatus, Priority, ServiceOrderStatus } from '@prisma/client'

const STATUS_ORDER: ServiceOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'FINISHED', 'CANCELED']
const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
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

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
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
    customersCount,
    employeesCount,
    employeesWithAccessCount,
    servicesCount,
    ordersCount,
    ordersStatusAgg,
    ordersPriorityAgg,
    finishedTotals,
    finishedThisMonthTotals,
    monthlyOrders,
    topCustomersAgg,
    customerNames,
    recentOrders,
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
    prisma.customer.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId, hasAccess: true } }),
    prisma.service.count({ where: { companyId } }),
    prisma.serviceOrder.count({ where: { companyId } }),
    prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true }
    }),
    prisma.serviceOrder.groupBy({
      by: ['priority'],
      where: { companyId },
      _count: { _all: true }
    }),
    prisma.serviceOrder.aggregate({
      where: { companyId, status: 'FINISHED' },
      _sum: { total: true },
      _avg: { total: true }
    }),
    prisma.serviceOrder.aggregate({
      where: {
        companyId,
        status: 'FINISHED',
        updatedAt: { gte: thisMonthStart }
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
      where: { companyId, customerId: { not: null } },
      _count: { _all: true },
      _sum: { total: true }
    }),
    prisma.customer.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.serviceOrder.findMany({
      where: { companyId },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            name: true
          }
        },
        responsibleEmployee: {
          select: {
            name: true
          }
        }
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

  const statusCountMap = new Map<ServiceOrderStatus, number>(
    ordersStatusAgg.map(item => [item.status, item._count._all])
  )

  const priorityCountMap = new Map<Priority, number>(
    ordersPriorityAgg.map(item => [item.priority, item._count._all])
  )

  for (const order of monthlyOrders) {
    const openKey = monthKey(order.createdAt)
    const openBucket = monthBucketMap.get(openKey)
    if (openBucket) {
      openBucket.opened += 1
    }

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
    .sort((a, b) => (b.orders - a.orders) || (b.revenue - a.revenue))
    .slice(0, 6)

  const statusSummary = {
    open: statusCountMap.get('OPEN') || 0,
    inProgress: statusCountMap.get('IN_PROGRESS') || 0,
    waitingCustomer: statusCountMap.get('WAITING_CUSTOMER') || 0,
    finished: statusCountMap.get('FINISHED') || 0,
    canceled: statusCountMap.get('CANCELED') || 0
  }

  const invoiceStatusCountMap = new Map<InvoiceStatus, number>()
  const invoiceStatusAmountMap = new Map<InvoiceStatus, number>()
  const boletoStatusCountMap = new Map<BoletoStatus, number>()

  let invoiceAmountTotal = 0
  let invoiceAmountPaid = 0
  let invoiceAmountOpen = 0
  let boletoCount = 0
  let boletoAmountPending = 0
  let boletoAmountPaid = 0

  for (const invoice of invoiceSnapshot) {
    const status = invoice.status
    const total = Number(invoice.total || 0)

    invoiceAmountTotal += total
    invoiceStatusCountMap.set(status, (invoiceStatusCountMap.get(status) || 0) + 1)
    invoiceStatusAmountMap.set(status, (invoiceStatusAmountMap.get(status) || 0) + total)

    if (status === 'PAID') {
      invoiceAmountPaid += total
    }

    if (status === 'DRAFT' || status === 'ISSUED' || status === 'OVERDUE') {
      invoiceAmountOpen += total
    }

    if (invoice.boleto?.status) {
      boletoCount += 1
      const boletoStatus = invoice.boleto.status
      boletoStatusCountMap.set(boletoStatus, (boletoStatusCountMap.get(boletoStatus) || 0) + 1)

      if (boletoStatus === 'PENDING') {
        boletoAmountPending += total
      }

      if (boletoStatus === 'PAID') {
        boletoAmountPaid += total
      }
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    company: company
      ? {
          id: company.id,
          name: company.name,
          tradeName: company.tradeName,
          plan: company.plan
        }
      : null,
    counts: {
      customers: customersCount,
      employees: employeesCount,
      employeesWithAccess: employeesWithAccessCount,
      services: servicesCount,
      orders: ordersCount,
      invoices: invoiceSnapshot.length,
      boletos: boletoCount,
      ...statusSummary
    },
    finance: {
      finishedRevenueTotal: Number(finishedTotals._sum.total || 0),
      finishedRevenueThisMonth: Number(finishedThisMonthTotals._sum.total || 0),
      averageTicket: Number(finishedTotals._avg.total || 0),
      invoiceAmountTotal,
      invoiceAmountPaid,
      invoiceAmountOpen,
      boletoAmountPending,
      boletoAmountPaid,
      boletosPending: boletoStatusCountMap.get('PENDING') || 0,
      boletosPaid: boletoStatusCountMap.get('PAID') || 0,
      boletosExpired: boletoStatusCountMap.get('EXPIRED') || 0,
      boletosCanceled: boletoStatusCountMap.get('CANCELED') || 0
    },
    charts: {
      status: STATUS_ORDER.map(status => ({
        status,
        total: statusCountMap.get(status) || 0
      })),
      priority: PRIORITY_ORDER.map(priority => ({
        priority,
        total: priorityCountMap.get(priority) || 0
      })),
      monthly: monthBuckets,
      invoiceStatus: INVOICE_STATUS_ORDER.map(status => ({
        status,
        total: invoiceStatusCountMap.get(status) || 0,
        amount: Number((invoiceStatusAmountMap.get(status) || 0).toFixed(2))
      })),
      boletoStatus: BOLETO_STATUS_ORDER.map(status => ({
        status,
        total: boletoStatusCountMap.get(status) || 0
      }))
    },
    topCustomers,
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      title: order.title,
      status: order.status,
      priority: order.priority,
      total: Number(order.total || 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerName: order.customer?.name || 'Sem cliente',
      responsibleName: order.responsibleEmployee?.name || 'Sem responsavel'
    }))
  }

  return NextResponse.json(payload)
}
