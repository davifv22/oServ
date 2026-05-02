"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

type FinancePayload = {
  generatedAt: string
  company: {
    id: string
    name: string
    tradeName: string | null
    plan: 'STARTER' | 'PRO' | 'ENTERPRISE'
  } | null
  summary: {
    totalOrders: number
    finishedOrders: number
    activeOrders: number
    canceledOrders: number
    conversionRate: number
    totalRevenue: number
    thisMonthRevenue: number
    previousMonthRevenue: number
    monthGrowthPercent: number
    pipelineRevenue: number
    canceledRevenue: number
    averageTicket: number
  }
  charts: {
    monthly: Array<{ key: string, month: string, opened: number, finished: number, revenue: number }>
    byStatus: Array<{ status: string, label: string, orders: number, revenue: number }>
    pipelineByPriority: Array<{ priority: string, label: string, orders: number, revenue: number }>
  }
  topCustomers: Array<{
    customerId: string
    name: string
    orders: number
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    title: string
    total: number
    updatedAt: string
    customerName: string
    responsibleName: string
  }>
  pipelineOrders: Array<{
    id: string
    title: string
    total: number
    status: string
    updatedAt: string
    customerName: string
    responsibleName: string
  }>
}

const PLAN_LABEL: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise'
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING_CUSTOMER: 'Aguardando cliente',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('pt-BR')
}

function statusBadgeClass(status: string) {
  if (status === 'OPEN') return 'bg-primary'
  if (status === 'IN_PROGRESS') return 'bg-info badge-contrast'
  if (status === 'WAITING_CUSTOMER') return 'bg-warning badge-contrast'
  if (status === 'FINISHED') return 'bg-success'
  if (status === 'CANCELED') return 'bg-danger'
  return 'bg-secondary'
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinancePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const loadErrorShownRef = useRef(false)

  async function load(silent = false) {
    if (silent) {
      setSyncing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/finance', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erro ao carregar financeiro')
      }

      const payload = await response.json() as FinancePayload
      setData(payload)
      loadErrorShownRef.current = false
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Nao foi possivel carregar os dados financeiros.', type: 'error' })
        loadErrorShownRef.current = true
      }
    } finally {
      if (silent) {
        setSyncing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void load(false)
    const interval = setInterval(() => {
      void load(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const monthlyRevenueChart = useMemo(() => {
    if (!data) return []
    return data.charts.monthly.map(item => ({
      month: item.month,
      revenue: Number(item.revenue.toFixed(2)),
      opened: item.opened,
      finished: item.finished
    }))
  }, [data])

  const statusRevenueChart = useMemo(() => {
    if (!data) return []
    return data.charts.byStatus.map(item => ({
      name: item.label,
      revenue: Number(item.revenue.toFixed(2))
    }))
  }, [data])

  const priorityPipelineChart = useMemo(() => {
    if (!data) return []
    return data.charts.pipelineByPriority.map(item => ({
      name: item.label,
      revenue: Number(item.revenue.toFixed(2))
    }))
  }, [data])

  if (loading && !data) {
    return <Loader label="Carregando painel financeiro..." />
  }

  if (!data) {
    return (
      <div className="card p-4">
        <h4 className="mb-2">Financeiro indisponivel</h4>
        <p className="text-muted mb-3">Nao foi possivel buscar os dados agora.</p>
        <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={() => void load(false)}>
          Tentar novamente
        </Button>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  const growthPositive = data.summary.monthGrowthPercent >= 0

  return (
    <div className="finance-premium">
      <section className="finance-hero-card card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <span className="finance-chip">Financeiro em tempo real</span>
            <h2 className="mt-2 mb-1">Painel Financeiro Premium</h2>
            <p className="text-muted mb-1">
              Empresa: <strong>{data.company?.tradeName || data.company?.name || 'Empresa'}</strong>
              {' '}| Plano: <strong>{PLAN_LABEL[data.company?.plan || 'STARTER']}</strong>
            </p>
            <small className="text-muted">Atualizado em {formatDateTime(data.generatedAt)}</small>
          </div>

          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load(true)} disabled={syncing}>
            <i className={`fa-solid ${syncing ? 'fa-rotate fa-spin' : 'fa-rotate-right'} me-2`} />
            {syncing ? 'Sincronizando...' : 'Atualizar'}
          </Button>
        </div>
      </section>

      <section className="dashboard-kpi-grid mb-3">
        <article className="dashboard-kpi-card card p-3">
          <span>Receita total</span>
          <strong>{formatCurrency(data.summary.totalRevenue)}</strong>
          <small>OS finalizadas acumuladas</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Receita do mes</span>
          <strong>{formatCurrency(data.summary.thisMonthRevenue)}</strong>
          <small>
            {growthPositive ? '+' : ''}{formatPercent(data.summary.monthGrowthPercent)} vs mes anterior
          </small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Pipeline aberto</span>
          <strong>{formatCurrency(data.summary.pipelineRevenue)}</strong>
          <small>{data.summary.activeOrders} ordens em aberto</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Ticket medio</span>
          <strong>{formatCurrency(data.summary.averageTicket)}</strong>
          <small>{data.summary.finishedOrders} ordens concluidas</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Taxa de conclusao</span>
          <strong>{formatPercent(data.summary.conversionRate)}</strong>
          <small>Sobre {data.summary.totalOrders} ordens totais</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Receita cancelada</span>
          <strong>{formatCurrency(data.summary.canceledRevenue)}</strong>
          <small>{data.summary.canceledOrders} ordens canceladas</small>
        </article>
      </section>

      <section className="row g-3 mb-3">
        <div className="col-12 col-xl-7">
          <div className="card p-3 p-md-4 dashboard-chart-card">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Receita mensal</h5>
              <small className="text-muted">Evolucao dos ultimos 12 meses por OS finalizadas</small>
            </div>

            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueChart}>
                  <defs>
                    <linearGradient id="financeRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22b8cf" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22b8cf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22b8cf" fill="url(#financeRevenueGradient)" strokeWidth={2.2} name="Receita" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card p-3 p-md-4 dashboard-chart-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Receita por status</h5>
              <small className="text-muted">Distribuicao financeira do funil</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusRevenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <div className="card p-3 p-md-4 dashboard-chart-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Pipeline por prioridade</h5>
              <small className="text-muted">Valor potencial nas OS ativas</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityPipelineChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card p-3 p-md-4 dashboard-list-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Top clientes por receita</h5>
              <small className="text-muted">Clientes com maior impacto financeiro</small>
            </div>

            <div className="dashboard-top-list">
              {data.topCustomers.length === 0 && <small className="text-muted">Sem clientes com receita finalizada ainda.</small>}
              {data.topCustomers.map((customer, index) => (
                <div className="dashboard-top-item" key={`${customer.customerId}-${index}`}>
                  <div>
                    <strong>{index + 1}. {customer.name}</strong>
                    <small className="d-block text-muted">{customer.orders} OS finalizadas</small>
                  </div>
                  <span>{formatCurrency(customer.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="card p-3 p-md-4 dashboard-table-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Transacoes recentes</h5>
              <small className="text-muted">Ultimas OS finalizadas (entrada de receita)</small>
            </div>

            <div className="table-responsive mt-2">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>OS</th>
                    <th>Cliente</th>
                    <th>Responsavel</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-muted">Sem transacoes finalizadas ainda.</td>
                    </tr>
                  )}
                  {data.recentTransactions.map(item => (
                    <tr key={item.id}>
                      <td><a href={`/ordens-servico/${item.id}`} className="dashboard-order-link">{item.title}</a></td>
                      <td>{item.customerName}</td>
                      <td>{item.responsibleName}</td>
                      <td>{formatCurrency(item.total)}</td>
                      <td>{formatDateTime(item.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card p-3 p-md-4 dashboard-table-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Pipeline mais valioso</h5>
              <small className="text-muted">OS abertas com maior valor potencial</small>
            </div>

            <div className="finance-pipeline-list mt-2">
              {data.pipelineOrders.length === 0 && <small className="text-muted">Sem ordens ativas no pipeline.</small>}

              {data.pipelineOrders.map(order => (
                <article className="finance-pipeline-item" key={order.id}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <a href={`/ordens-servico/${order.id}`} className="dashboard-order-link fw-semibold">
                      {order.title}
                    </a>
                    <span className={`badge ${statusBadgeClass(order.status)}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                  <small className="text-muted d-block">Cliente: {order.customerName}</small>
                  <small className="text-muted d-block">Responsavel: {order.responsibleName}</small>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <strong>{formatCurrency(order.total)}</strong>
                    <small className="text-muted">{formatDateTime(order.updatedAt)}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
