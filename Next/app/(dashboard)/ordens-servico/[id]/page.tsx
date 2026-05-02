"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrencyBRL, formatCurrencyInput, formatPhone, numberToCurrencyInput, parseCurrencyInput } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportServiceOrderPdf } from '@/lib/pdf'

const statusOptions = [
  { value: 'OPEN', label: 'Aberta' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'WAITING_CUSTOMER', label: 'Aguardando cliente' },
  { value: 'FINISHED', label: 'Finalizada' },
  { value: 'CANCELED', label: 'Cancelada' }
]

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
]

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function highlightMentions(message: string) {
  return message.split(/(@[\w.-]+)/g).map((part, index) => {
    if (part.startsWith('@')) return <strong key={index} className="text-app-accent">{part}</strong>
    return <span key={index}>{part}</span>
  })
}

function groupByDay(items: any[]) {
  return items.reduce((acc: any, item) => {
    const date = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    acc[date] = acc[date] || []
    acc[date].push(item)
    return acc
  }, {})
}

function getTimelineIconClass(item: any) {
  if (item.type === 'comment') return 'fa-regular fa-comment-dots'
  if (item.action === 'STATUS_CHANGED') return 'fa-solid fa-arrows-rotate'
  if (item.action === 'CREATED') return 'fa-solid fa-plus'
  if (item.action === 'ASSIGNED') return 'fa-solid fa-user-check'
  return 'fa-regular fa-note-sticky'
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    OPEN: 'Aberta',
    IN_PROGRESS: 'Em andamento',
    WAITING_CUSTOMER: 'Aguardando cliente',
    FINISHED: 'Finalizada',
    CANCELED: 'Cancelada'
  }

  return labels[status || ''] || 'Nao definido'
}

function translateStatusCode(value?: string) {
  if (!value) return value || ''

  const labels: Record<string, string> = {
    OPEN: 'Aberta',
    IN_PROGRESS: 'Em andamento',
    WAITING_CUSTOMER: 'Aguardando cliente',
    FINISHED: 'Finalizada',
    CANCELED: 'Cancelada'
  }

  return labels[value] || value
}

function localizeStatusTokens(text?: string) {
  if (!text) return text || ''

  return text.replace(/\b(OPEN|IN_PROGRESS|WAITING_CUSTOMER|FINISHED|CANCELED)\b/g, code => translateStatusCode(code))
}

function priorityLabel(priority?: string) {
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente'
  }

  return labels[priority || ''] || 'Nao definida'
}

function statusBadgeClass(status?: string) {
  if (status === 'OPEN') return 'border-sky-400/30 bg-sky-500/20 text-sky-100'
  if (status === 'IN_PROGRESS') return 'border-cyan-400/30 bg-cyan-500/20 text-cyan-100'
  if (status === 'WAITING_CUSTOMER') return 'border-amber-400/30 bg-amber-500/20 text-amber-100'
  if (status === 'FINISHED') return 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100'
  if (status === 'CANCELED') return 'border-red-400/30 bg-red-500/20 text-red-100'
  return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
}

function priorityBadgeClass(priority?: string) {
  if (priority === 'LOW') return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
  if (priority === 'MEDIUM') return 'border-cyan-400/30 bg-cyan-500/20 text-cyan-100'
  if (priority === 'HIGH') return 'border-amber-400/30 bg-amber-500/20 text-amber-100'
  if (priority === 'URGENT') return 'border-red-400/30 bg-red-500/20 text-red-100'
  return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
}

function pillClassName(tone: string) {
  return `inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`
}

export default function ServiceOrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [printingPdf, setPrintingPdf] = useState(false)
  const [printOptions, setPrintOptions] = useState({
    includeComments: true,
    includeTimeline: true
  })
  const [editSaving, setEditSaving] = useState(false)
  const loadErrorShownRef = useRef(false)
  const [editForm, setEditForm] = useState<any>({
    title: '',
    description: '',
    customerId: '',
    responsibleEmployeeId: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    total: 0,
    totalInput: '0,00'
  })

  async function load() {
    setLoading(true)

    try {
      const [orderRes, timelineRes, commentsRes] = await Promise.all([
        fetch(`/api/service-orders/${params.id}`, { cache: 'no-store' }),
        fetch(`/api/service-orders/${params.id}/timeline`, { cache: 'no-store' }),
        fetch(`/api/service-orders/${params.id}/comments`, { cache: 'no-store' })
      ])

      const allOk = orderRes.ok && timelineRes.ok && commentsRes.ok
      if (!allOk) {
        if (!loadErrorShownRef.current) {
          setToast({ message: 'Erro ao carregar dados da ordem de servico', type: 'error' })
          loadErrorShownRef.current = true
        }
      } else if (loadErrorShownRef.current) {
        loadErrorShownRef.current = false
      }

      if (orderRes.ok) setOrder(await orderRes.json())
      if (timelineRes.ok) setTimeline(await timelineRes.json())
      if (commentsRes.ok) setComments(await commentsRes.json())
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Erro de conexao ao carregar a OS', type: 'error' })
        loadErrorShownRef.current = true
      }
    } finally {
      setLoading(false)
    }
  }

  function openPrintModal() {
    if (!order) {
      setToast({ message: 'Dados da OS ainda nao carregaram', type: 'error' })
      return
    }

    setPrintModalOpen(true)
  }

  async function printOrderPdf() {
    if (!order) return

    const pipelineTimeline = timeline.filter(item => item?.type !== 'comment')
    setPrintingPdf(true)

    try {
      await exportServiceOrderPdf(order, comments, `os-${params.id}.pdf`, {
        includeComments: printOptions.includeComments,
        includeTimeline: printOptions.includeTimeline,
        timeline: pipelineTimeline
      })
      setPrintModalOpen(false)
    } catch {
      setToast({ message: 'Erro ao gerar PDF da OS', type: 'error' })
    } finally {
      setPrintingPdf(false)
    }
  }

  async function loadSupportData() {
    try {
      const [customersRes, employeesRes] = await Promise.all([
        fetch('/api/customers', { cache: 'no-store' }),
        fetch('/api/employees', { cache: 'no-store' })
      ])

      if (!customersRes.ok || !employeesRes.ok) {
        setToast({ message: 'Erro ao carregar clientes e funcionarios da OS', type: 'error' })
      }

      if (customersRes.ok) setCustomers(await customersRes.json())
      if (employeesRes.ok) setEmployees(await employeesRes.json())
    } catch {
      setToast({ message: 'Erro de conexao ao carregar dados auxiliares da OS', type: 'error' })
    }
  }

  useEffect(() => {
    void load()
    void loadSupportData()

    const interval = setInterval(() => {
      void load()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  async function sendComment(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const res = await fetch(`/api/service-orders/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    if (res.ok) {
      setMessage('')
      setToast({ message: 'Comentario enviado', type: 'success' })
      await load()
    } else {
      setToast({ message: 'Erro ao enviar comentario', type: 'error' })
    }
  }

  function openEditModal() {
    if (!order) {
      setToast({ message: 'Dados da OS ainda carregando', type: 'error' })
      return
    }

    setEditForm({
      title: order.title || '',
      description: order.description || '',
      customerId: order.customerId || '',
      responsibleEmployeeId: order.responsibleEmployeeId || '',
      status: order.status || 'OPEN',
      priority: order.priority || 'MEDIUM',
      total: Number(order.total || 0),
      totalInput: numberToCurrencyInput(order.total || 0)
    })

    setEditModalOpen(true)
  }

  async function saveOrderChanges(e: React.FormEvent) {
    e.preventDefault()

    if (!order?.id) return
    if (!String(editForm.title || '').trim()) {
      setToast({ message: 'Informe o titulo da OS', type: 'error' })
      return
    }

    const parsedTotal = parseCurrencyInput(editForm.totalInput)
    if (parsedTotal < 0) {
      setToast({ message: 'Informe um valor total valido', type: 'error' })
      return
    }

    setEditSaving(true)

    try {
      const response = await fetch('/api/service-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          title: String(editForm.title || '').trim(),
          description: String(editForm.description || '').trim() || null,
          customerId: editForm.customerId || null,
          responsibleEmployeeId: editForm.responsibleEmployeeId || null,
          status: editForm.status,
          priority: editForm.priority,
          total: parsedTotal
        })
      })

      if (!response.ok) {
        setToast({ message: 'Erro ao salvar alteracoes da OS', type: 'error' })
        return
      }

      setToast({ message: 'OS atualizada com sucesso', type: 'success' })
      setEditModalOpen(false)
      await load()
    } finally {
      setEditSaving(false)
    }
  }

  const groupedTimeline = useMemo(() => groupByDay(timeline), [timeline])
  const lastTimelineItem = timeline.length > 0 ? timeline[timeline.length - 1] : null

  if (loading && !order) {
    return <Loader label="Carregando detalhes da OS..." />
  }

  return (
    <div className="service-order-detail-page space-y-4">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <Button variant="outline" size="sm" className="mb-3 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" asChild>
            <a href="/ordens-servico?view=kanban">
              <i className="fa-solid fa-arrow-left mr-1" />
              Voltar para Kanban
            </a>
          </Button>
          <h2 className="text-3xl font-bold">Detalhes da Ordem de Servico</h2>
          <p className="text-muted-foreground">Comentarios, interacao da equipe e timeline completa da OS.</p>
        </div>

        <Card className="service-order-summary-card min-w-[220px]">
          <CardContent className="p-3 space-y-1">
            <small className="text-muted-foreground block">Identificador da OS</small>
            <strong className="break-all">{params.id}</strong>
            <small className="text-muted-foreground block pt-1">{loading ? 'Sincronizando...' : 'Atualizacao automatica ativa'}</small>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="min-w-0">
              <h5 className="mb-1 text-xl font-semibold break-words">{order?.title || 'OS sem titulo'}</h5>
              <small className="text-muted-foreground block">ID: {params.id}</small>
              <small className="text-muted-foreground block">Comentarios: {comments.length} | Eventos: {timeline.length}</small>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className={pillClassName(statusBadgeClass(order?.status))}>{statusLabel(order?.status)}</span>
              <span className={pillClassName(priorityBadgeClass(order?.priority))}>{priorityLabel(order?.priority)}</span>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={openPrintModal}>
                <i className="fa fa-print mr-1" />
                Imprimir OS
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={openEditModal}>
                <i className="fa-regular fa-pen-to-square mr-1" />
                Editar OS
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setTimelineModalOpen(true)}>
                <i className="fa-regular fa-clock mr-1" />
                Abrir timeline
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-12 space-y-2">
              <label className="text-sm text-muted-foreground">Descricao</label>
                  {order?.description?.trim() ? (
                    <p className="mb-0 whitespace-pre-wrap">{order.description}</p>
                  ) : (
                    <small className="text-muted-foreground">Sem descricao informada.</small>
                  )}
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-sm text-muted-foreground">Cliente</label>
              <strong className="block">{order?.customer?.name || 'Sem cliente'}</strong>
              <small className="text-muted-foreground block">Email: {order?.customer?.email || '-'}</small>
              <small className="text-muted-foreground block">Telefone: {formatPhone(order?.customer?.phone) || '-'}</small>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-sm text-muted-foreground">Responsavel</label>
              <strong className="block">{order?.responsibleEmployee?.name || 'Sem responsavel'}</strong>
              <small className="text-muted-foreground block">Email: {order?.responsibleEmployee?.email || '-'}</small>
              <small className="text-muted-foreground block">Telefone: {formatPhone(order?.responsibleEmployee?.phone) || '-'}</small>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-sm text-muted-foreground">Financeiro e datas</label>
              <strong className="block">{formatCurrencyBRL(order?.total || 0)}</strong>
              <small className="text-muted-foreground block">Criada em: {formatDateTime(order?.createdAt)}</small>
              <small className="text-muted-foreground block">Atualizada em: {formatDateTime(order?.updatedAt)}</small>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <CardTitle>Comentarios</CardTitle>
                  <small className="text-muted-foreground">Use @nome para mencionar alguem da equipe.</small>
                </div>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-app-border bg-app-surface-alt px-2 py-0.5 text-xs text-muted-foreground">{comments.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {comments.length === 0 && <small className="text-muted-foreground">Nenhum comentario ainda.</small>}

              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-app-surface-alt text-xs font-semibold text-app-text">
                    {initials(comment.author?.name)}
                  </span>

                  <div className="flex-1 rounded-xl border border-app-border bg-app-surface p-3">
                    <div className="flex flex-wrap justify-between gap-2">
                      <strong>{comment.author?.name || 'Usuario'}</strong>
                      <small className="text-muted-foreground">{formatDateTime(comment.createdAt)}</small>
                    </div>

                    <div className="mt-1">{highlightMentions(comment.message)}</div>
                  </div>
                </div>
              ))}
              <form onSubmit={sendComment} className="space-y-3">
                <Textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Digite uma atualizacao da OS. Ex: @joao verificar arte final."
                />

                <div className="flex justify-end">
                  <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent">Enviar comentario</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-5">
          <Card className="timeline-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <CardTitle>Timeline da OS</CardTitle>
                  <small className="text-muted-foreground">Abra em modal para visualizar o historico completo com scroll.</small>
                </div>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-app-border bg-app-surface-alt px-2 py-0.5 text-xs text-muted-foreground">{timeline.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastTimelineItem ? (
                <Card className="shadow-none border-app-border bg-app-surface">
                  <CardContent className="p-3">
                    <small className="text-muted-foreground block">Ultimo evento</small>
                    <strong className="block mt-1">{lastTimelineItem.actor?.name || 'Sistema'}</strong>
                    <small className="text-muted-foreground block">{formatDateTime(lastTimelineItem.createdAt)}</small>
                    <p className="mt-2 mb-0">
                      {lastTimelineItem.type === 'comment' ? lastTimelineItem.message : localizeStatusTokens(lastTimelineItem.message)}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <small className="text-muted-foreground">Nenhum historico ainda.</small>
              )}

              <Button variant="outline" className="w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setTimelineModalOpen(true)}>
                <i className="fa-regular fa-clock mr-1" />
                Abrir timeline completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {printModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => { if (!printingPdf) setPrintModalOpen(false) }}>
          <Card className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="space-y-2 mb-4">
              <h5 className="text-lg font-semibold">Confirmar impressao da OS</h5>
              <small className="text-muted-foreground">Escolha o que deseja incluir no PDF.</small>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={printOptions.includeComments}
                  onChange={e => setPrintOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                  disabled={printingPdf}
                />
                Incluir comentarios
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={printOptions.includeTimeline}
                  onChange={e => setPrintOptions(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                  disabled={printingPdf}
                />
                Incluir pipeline/timeline
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => setPrintModalOpen(false)}
                disabled={printingPdf}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => void printOrderPdf()}
                disabled={printingPdf}
              >
                {printingPdf ? 'Gerando PDF...' : 'Imprimir agora'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {editModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setEditModalOpen(false)}>
          <Card className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Editar Ordem de Servico</h5>
                <small className="text-muted-foreground">Atualize os dados principais da OS.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setEditModalOpen(false)}>Fechar</Button>
            </div>

            <form onSubmit={saveOrderChanges} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Titulo</label>
                  <Input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select value={editForm.customerId || ''} onChange={e => setEditForm({ ...editForm, customerId: e.target.value })}>
                    <option value="">Sem cliente</option>
                    {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </Select>
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Responsavel</label>
                  <Select value={editForm.responsibleEmployeeId || ''} onChange={e => setEditForm({ ...editForm, responsibleEmployeeId: e.target.value })}>
                    <option value="">Sem responsavel</option>
                    {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </Select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editForm.status || 'OPEN'} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={editForm.priority || 'MEDIUM'} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                    {priorityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-sm font-medium">Valor total</label>
                  <Input
                    inputMode="numeric"
                    value={editForm.totalInput || '0,00'}
                    onChange={e => {
                      const masked = formatCurrencyInput(e.target.value)
                      setEditForm({ ...editForm, totalInput: masked, total: parseCurrencyInput(masked) })
                    }}
                  />
                </div>

                <div className="md:col-span-12 space-y-2">
                  <label className="text-sm font-medium">Descricao</label>
                  <Textarea rows={4} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={editSaving}>{editSaving ? 'Salvando...' : 'Salvar alteracoes'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {timelineModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setTimelineModalOpen(false)}>
          <Card className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Timeline da Ordem de Servico</h5>
                <small className="text-muted-foreground">Historico completo com scroll.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setTimelineModalOpen(false)}>Fechar</Button>
            </div>

            <div className="timeline-modal-scroll">
              <div className="space-y-4">
                {timeline.length === 0 && <small className="text-muted-foreground">Nenhum historico ainda.</small>}

                {Object.entries(groupedTimeline).map(([day, items]: any) => (
                  <div key={day} className="space-y-3">
                    <div className="sticky top-0 z-10 inline-flex rounded-full border border-app-border bg-app-surface-alt px-3 py-1 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>

                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-app-border bg-app-surface p-3">
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-app-border bg-app-surface-alt text-muted-foreground">
                              <i className={getTimelineIconClass(item)} />
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap justify-between gap-2">
                                <strong>{item.actor?.name || 'Sistema'}</strong>
                                <small className="text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</small>
                              </div>

                              <div className="mt-1">
                                {item.type === 'comment' ? highlightMentions(item.message) : localizeStatusTokens(item.message)}
                              </div>

                              {item.oldValue && item.newValue && (
                                <small className="text-muted-foreground block mt-2">
                                  {translateStatusCode(item.oldValue)} -&gt; {translateStatusCode(item.newValue)}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
