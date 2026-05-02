"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

type DashboardPayload = {
  generatedAt: string
  company: {
    id: string
    name: string
    tradeName: string | null
    plan: 'STARTER' | 'PRO' | 'ENTERPRISE'
  } | null
  counts: {
    customers: number
    employees: number
    employeesWithAccess: number
    services: number
    orders: number
    open: number
    inProgress: number
    waitingCustomer: number
    finished: number
    canceled: number
  }
  finance: {
    finishedRevenueTotal: number
    finishedRevenueThisMonth: number
    averageTicket: number
  }
  charts: {
    status: Array<{ status: string, total: number }>
    priority: Array<{ priority: string, total: number }>
    monthly: Array<{ key: string, month: string, opened: number, finished: number, revenue: number }>
  }
  topCustomers: Array<{
    customerId: string
    name: string
    orders: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    title: string
    status: string
    priority: string
    total: number
    createdAt: string
    updatedAt: string
    customerName: string
    responsibleName: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING_CUSTOMER: 'Aguardando cliente',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada'
}

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente'
}

const PLAN_LABEL: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
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

function priorityBadgeClass(priority: string) {
  if (priority === 'LOW') return 'bg-secondary'
  if (priority === 'MEDIUM') return 'bg-info badge-contrast'
  if (priority === 'HIGH') return 'bg-warning badge-contrast'
  if (priority === 'URGENT') return 'bg-danger'
  return 'bg-secondary'
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null)
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
      const response = await fetch('/api/dashboard', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard')
      }

      const payload = await response.json() as DashboardPayload
      setData(payload)
      loadErrorShownRef.current = false
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Nao foi possivel carregar os dados do dashboard.', type: 'error' })
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

  const statusChartData = useMemo(() => {
    if (!data) return []
    return data.charts.status.map(item => ({
      name: STATUS_LABEL[item.status] || item.status,
      total: item.total
    }))
  }, [data])

  const priorityChartData = useMemo(() => {
    if (!data) return []
    return data.charts.priority.map(item => ({
      name: PRIORITY_LABEL[item.priority] || item.priority,
      total: item.total
    }))
  }, [data])

  if (loading && !data) {
    return <Loader label="Carregando dashboard premium..." />
  }

  if (!data) {
    return (
      <div className="card p-4">
        <h4 className="mb-2">Dashboard indisponivel</h4>
        <p className="text-muted mb-3">Nao foi possivel buscar os dados agora.</p>
        <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={() => void load(false)}>
          Tentar novamente
        </Button>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  return (
    <div className="dashboard-premium">
      <section className="dashboard-hero-card card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-chip">Visao executiva</span>
            <h2 className="mt-2 mb-1">Dashboard Premium</h2>
            <p className="text-muted mb-2">
              Empresa: <strong>{data.company?.tradeName || data.company?.name || 'Empresa'}</strong>
              {' '}| Plano: <strong>{PLAN_LABEL[data.company?.plan || 'STARTER']}</strong>
            </p>
            <small className="text-muted">
              Ultima atualizacao: {formatDateTime(data.generatedAt)}
            </small>
          </div>

          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load(true)} disabled={syncing}>
            <i className={`fa-solid ${syncing ? 'fa-rotate fa-spin' : 'fa-rotate-right'} me-2`} />
            {syncing ? 'Sincronizando...' : 'Atualizar dados'}
          </Button>
        </div>
      </section>

      <section className="dashboard-kpi-grid mb-3">
        <article className="dashboard-kpi-card card p-3">
          <span>Total de OS</span>
          <strong>{data.counts.orders}</strong>
          <small>{data.counts.open} abertas | {data.counts.inProgress} em andamento</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Clientes</span>
          <strong>{data.counts.customers}</strong>
          <small>Base ativa da empresa</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Equipe</span>
          <strong>{data.counts.employees}</strong>
          <small>{data.counts.employeesWithAccess} com acesso ao sistema</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Servicos</span>
          <strong>{data.counts.services}</strong>
          <small>Catalogo cadastrado</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Faturamento total</span>
          <strong>{formatCurrency(data.finance.finishedRevenueTotal)}</strong>
          <small>OS finalizadas</small>
        </article>

        <article className="dashboard-kpi-card card p-3">
          <span>Faturamento do mes</span>
          <strong>{formatCurrency(data.finance.finishedRevenueThisMonth)}</strong>
          <small>Ticket medio: {formatCurrency(data.finance.averageTicket)}</small>
        </article>
      </section>

      <section className="row g-3 mb-3">
        <div className="col-12 col-xl-7">
          <div className="card p-3 p-md-4 dashboard-chart-card">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Tendencia mensal</h5>
              <small className="text-muted">Abertura, conclusao e receita das OS</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.monthly}>
                  <defs>
                    <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="finishedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Area type="monotone" dataKey="opened" stroke="#0ea5e9" fill="url(#openedGradient)" strokeWidth={2.2} name="Abertas" />
                  <Area type="monotone" dataKey="finished" stroke="#22c55e" fill="url(#finishedGradient)" strokeWidth={2.2} name="Finalizadas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card p-3 p-md-4 dashboard-chart-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Distribuicao por status</h5>
              <small className="text-muted">Volume atual no funil operacional</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Bar dataKey="total" fill="#22b8cf" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <div className="card p-3 p-md-4 dashboard-list-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Top clientes</h5>
              <small className="text-muted">Clientes com maior volume de ordens</small>
            </div>

            <div className="dashboard-top-list">
              {data.topCustomers.length === 0 && (
                <small className="text-muted">Sem dados de clientes ainda.</small>
              )}

              {data.topCustomers.map((customer, index) => (
                <div className="dashboard-top-item" key={`${customer.customerId}-${index}`}>
                  <div>
                    <strong>{index + 1}. {customer.name}</strong>
                    <small className="d-block text-muted">{customer.orders} ordens</small>
                  </div>
                  <span>{formatCurrency(customer.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card p-3 p-md-4 dashboard-chart-card h-100">
            <div className="dashboard-card-head">
              <h5 className="mb-1">Prioridade das ordens</h5>
              <small className="text-muted">Distribuicao para balanceamento da equipe</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--app-surface)',
                      border: '1px solid var(--app-border)',
                      borderRadius: 10,
                      color: 'var(--app-text)'
                    }}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-3 p-md-4 dashboard-table-card">
        <div className="dashboard-card-head">
          <h5 className="mb-1">Ultimas ordens atualizadas</h5>
          <small className="text-muted">Acompanhe rapidamente as OS mais recentes</small>
        </div>

        <div className="table-responsive mt-2">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>OS</th>
                <th>Cliente</th>
                <th>Responsavel</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Valor</th>
                <th>Atualizada em</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">Nenhuma ordem encontrada.</td>
                </tr>
              )}

              {data.recentOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <a href={`/ordens-servico/${order.id}`} className="dashboard-order-link">
                      {order.title || 'Sem titulo'}
                    </a>
                  </td>
                  <td>{order.customerName}</td>
                  <td>{order.responsibleName}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(order.status)}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${priorityBadgeClass(order.priority)}`}>
                      {PRIORITY_LABEL[order.priority] || order.priority}
                    </span>
                  </td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>{formatDateTime(order.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
