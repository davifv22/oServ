"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  if (status === 'OPEN') return 'border-sky-400/30 bg-sky-500/20 text-sky-100'
  if (status === 'IN_PROGRESS') return 'border-cyan-400/30 bg-cyan-500/20 text-cyan-100'
  if (status === 'WAITING_CUSTOMER') return 'border-amber-400/30 bg-amber-500/20 text-amber-100'
  if (status === 'FINISHED') return 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100'
  if (status === 'CANCELED') return 'border-red-400/30 bg-red-500/20 text-red-100'
  return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
}

function pillClassName(tone: string) {
  return `inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`
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
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 text-xl font-semibold">Financeiro indisponivel</h4>
          <p className="text-muted-foreground mb-3">Nao foi possivel buscar os dados agora.</p>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={() => void load(false)}>
            Tentar novamente
          </Button>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </CardContent>
      </Card>
    )
  }

  const growthPositive = data.summary.monthGrowthPercent >= 0

  return (
    <div className="finance-premium space-y-3">
      <Card className="finance-hero-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <span className="finance-chip">Financeiro em tempo real</span>
              <h2 className="mt-2 mb-1 text-3xl font-bold">Painel Financeiro Premium</h2>
              <p className="text-muted-foreground mb-1">
                Empresa: <strong>{data.company?.tradeName || data.company?.name || 'Empresa'}</strong>
                {' '}| Plano: <strong>{PLAN_LABEL[data.company?.plan || 'STARTER']}</strong>
              </p>
              <small className="text-muted-foreground">Atualizado em {formatDateTime(data.generatedAt)}</small>
            </div>

            <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load(true)} disabled={syncing}>
              <i className={`fa-solid ${syncing ? 'fa-rotate fa-spin' : 'fa-rotate-right'} mr-2`} />
              {syncing ? 'Sincronizando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="dashboard-kpi-grid">
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Receita total</span><strong>{formatCurrency(data.summary.totalRevenue)}</strong><small>OS finalizadas acumuladas</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Receita do mes</span><strong>{formatCurrency(data.summary.thisMonthRevenue)}</strong><small>{growthPositive ? '+' : ''}{formatPercent(data.summary.monthGrowthPercent)} vs mes anterior</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Pipeline aberto</span><strong>{formatCurrency(data.summary.pipelineRevenue)}</strong><small>{data.summary.activeOrders} ordens em aberto</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Ticket medio</span><strong>{formatCurrency(data.summary.averageTicket)}</strong><small>{data.summary.finishedOrders} ordens concluidas</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Taxa de conclusao</span><strong>{formatPercent(data.summary.conversionRate)}</strong><small>Sobre {data.summary.totalOrders} ordens totais</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Receita cancelada</span><strong>{formatCurrency(data.summary.canceledRevenue)}</strong><small>{data.summary.canceledOrders} ordens canceladas</small></CardContent></Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-12">
        <Card className="dashboard-chart-card xl:col-span-7">
          <CardContent className="p-4 md:p-5">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Receita mensal</h5>
              <small className="text-muted-foreground">Evolucao dos ultimos 12 meses por OS finalizadas</small>
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
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} contentStyle={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 10, color: 'var(--app-text)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#22b8cf" fill="url(#financeRevenueGradient)" strokeWidth={2.2} name="Receita" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-chart-card xl:col-span-5">
          <CardContent className="p-4 md:p-5 h-full">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Receita por status</h5>
              <small className="text-muted-foreground">Distribuicao financeira do funil</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusRevenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} contentStyle={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 10, color: 'var(--app-text)' }} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-12">
        <Card className="dashboard-chart-card xl:col-span-6">
          <CardContent className="p-4 md:p-5 h-full">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Pipeline por prioridade</h5>
              <small className="text-muted-foreground">Valor potencial nas OS ativas</small>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityPipelineChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--app-border)' }} tickLine={false} />
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} contentStyle={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 10, color: 'var(--app-text)' }} />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-list-card xl:col-span-6">
          <CardContent className="p-4 md:p-5 h-full">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Top clientes por receita</h5>
              <small className="text-muted-foreground">Clientes com maior impacto financeiro</small>
            </div>

            <div className="dashboard-top-list">
              {data.topCustomers.length === 0 && <small className="text-muted-foreground">Sem clientes com receita finalizada ainda.</small>}
              {data.topCustomers.map((customer, index) => (
                <div className="dashboard-top-item" key={`${customer.customerId}-${index}`}>
                  <div>
                    <strong>{index + 1}. {customer.name}</strong>
                    <small className="block text-muted-foreground">{customer.orders} OS finalizadas</small>
                  </div>
                  <span>{formatCurrency(customer.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-12">
        <Card className="dashboard-table-card xl:col-span-7">
          <CardContent className="p-4 md:p-5 h-full">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Transacoes recentes</h5>
              <small className="text-muted-foreground">Ultimas OS finalizadas (entrada de receita)</small>
            </div>

            <div className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Responsavel</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">Sem transacoes finalizadas ainda.</TableCell>
                    </TableRow>
                  )}
                  {data.recentTransactions.map(item => (
                    <TableRow key={item.id}>
                      <TableCell><a href={`/ordens-servico/${item.id}`} className="dashboard-order-link">{item.title}</a></TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.responsibleName}</TableCell>
                      <TableCell>{formatCurrency(item.total)}</TableCell>
                      <TableCell>{formatDateTime(item.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-table-card xl:col-span-5">
          <CardContent className="p-4 md:p-5 h-full">
            <div className="dashboard-card-head">
              <h5 className="mb-1 text-lg font-semibold">Pipeline mais valioso</h5>
              <small className="text-muted-foreground">OS abertas com maior valor potencial</small>
            </div>

            <div className="finance-pipeline-list mt-2">
              {data.pipelineOrders.length === 0 && <small className="text-muted-foreground">Sem ordens ativas no pipeline.</small>}

              {data.pipelineOrders.map(order => (
                <article className="finance-pipeline-item" key={order.id}>
                  <div className="flex justify-between items-start gap-2">
                    <a href={`/ordens-servico/${order.id}`} className="dashboard-order-link font-semibold">
                      {order.title}
                    </a>
                    <span className={pillClassName(statusBadgeClass(order.status))}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                  <small className="text-muted-foreground block">Cliente: {order.customerName}</small>
                  <small className="text-muted-foreground block">Responsavel: {order.responsibleName}</small>
                  <div className="flex justify-between items-center mt-2">
                    <strong>{formatCurrency(order.total)}</strong>
                    <small className="text-muted-foreground">{formatDateTime(order.updatedAt)}</small>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
