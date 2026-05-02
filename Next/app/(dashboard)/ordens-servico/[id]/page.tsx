"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
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
    if (part.startsWith('@')) return <strong key={index} className="text-primary">{part}</strong>
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
  if (status === 'OPEN') return 'bg-primary'
  if (status === 'IN_PROGRESS') return 'bg-info badge-contrast'
  if (status === 'WAITING_CUSTOMER') return 'bg-warning badge-contrast'
  if (status === 'FINISHED') return 'bg-success'
  if (status === 'CANCELED') return 'bg-danger'
  return 'bg-secondary'
}

function priorityBadgeClass(priority?: string) {
  if (priority === 'LOW') return 'bg-secondary'
  if (priority === 'MEDIUM') return 'bg-info badge-contrast'
  if (priority === 'HIGH') return 'bg-warning badge-contrast'
  if (priority === 'URGENT') return 'bg-danger'
  return 'bg-secondary'
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
  const [editSaving, setEditSaving] = useState(false)
  const loadErrorShownRef = useRef(false)
  const [editForm, setEditForm] = useState<any>({
    title: '',
    description: '',
    customerId: '',
    responsibleEmployeeId: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    total: 0
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

  async function printOrderPdf() {
    if (!order) {
      setToast({ message: 'Dados da OS ainda não carregaram', type: 'error' })
      return
    }

    try {
      await exportServiceOrderPdf(order, comments, `os-${params.id}.pdf`)
    } catch {
      setToast({ message: 'Erro ao gerar PDF da OS', type: 'error' })
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
      total: Number(order.total || 0)
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
          total: Number(editForm.total || 0)
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
    <div className="service-order-detail-page">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <a href="/ordens-servico" className="btn btn-sm btn-outline-secondary mb-3">Voltar para Kanban</a>
          <h2 className="mb-1">Detalhes da Ordem de Servico</h2>
          <p className="text-muted mb-0">Comentarios, interacao da equipe e timeline completa da OS.</p>
        </div>

        <div className="card p-3 service-order-summary-card">
          <small className="text-muted">Identificador da OS</small>
          <strong className="text-break">{params.id}</strong>
          <small className="text-muted mt-2">{loading ? 'Sincronizando...' : 'Atualizacao automatica ativa'}</small>
        </div>
      </div>

      <div className="card p-3 p-md-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div className="min-w-0">
            <h5 className="mb-1 text-break">{order?.title || 'OS sem titulo'}</h5>
            <small className="text-muted d-block">ID: {params.id}</small>
            <small className="text-muted d-block">Comentarios: {comments.length} | Eventos: {timeline.length}</small>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className={`badge ${statusBadgeClass(order?.status)}`}>{statusLabel(order?.status)}</span>
            <span className={`badge ${priorityBadgeClass(order?.priority)}`}>{priorityLabel(order?.priority)}</span>
            <button className="btn btn-sm btn-outline-primary" onClick={() => void printOrderPdf()}>
              <i className="fa-regular fa-print me-1" />
              Imprimir OS
            </button>
            <button className="btn btn-sm btn-outline-primary" onClick={openEditModal}>
              <i className="fa-regular fa-pen-to-square me-1" />
              Editar OS
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setTimelineModalOpen(true)}>
              <i className="fa-regular fa-clock me-1" />
              Abrir timeline
            </button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <label className="form-label mb-1 text-muted">Descricao</label>
            <div className="card p-3">
              {order?.description?.trim() ? (
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{order.description}</p>
              ) : (
                <small className="text-muted">Sem descricao informada.</small>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label mb-1 text-muted">Cliente</label>
            <div><strong>{order?.customer?.name || 'Sem cliente'}</strong></div>
            <small className="text-muted d-block">Email: {order?.customer?.email || '-'}</small>
            <small className="text-muted d-block">Telefone: {order?.customer?.phone || '-'}</small>
          </div>

          <div className="col-md-4">
            <label className="form-label mb-1 text-muted">Responsavel</label>
            <div><strong>{order?.responsibleEmployee?.name || 'Sem responsavel'}</strong></div>
            <small className="text-muted d-block">Email: {order?.responsibleEmployee?.email || '-'}</small>
            <small className="text-muted d-block">Telefone: {order?.responsibleEmployee?.phone || '-'}</small>
          </div>

          <div className="col-md-4">
            <label className="form-label mb-1 text-muted">Financeiro e datas</label>
            <div><strong>R$ {Number(order?.total || 0).toFixed(2)}</strong></div>
            <small className="text-muted d-block">Criada em: {formatDateTime(order?.createdAt)}</small>
            <small className="text-muted d-block">Atualizada em: {formatDateTime(order?.updatedAt)}</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card p-3 p-md-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">Comentarios</h5>
                <small className="text-muted">Use @nome para mencionar alguem da equipe.</small>
              </div>
              <span className="badge bg-secondary">{comments.length}</span>
            </div>

            <div className="comments-list">
              {comments.length === 0 && <small className="text-muted">Nenhum comentario ainda.</small>}

              {comments.map(comment => (
                <div key={comment.id} className="comment-bubble-row">
                  <span className="responsible-avatar">{initials(comment.author?.name)}</span>

                  <div className="comment-bubble">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                      <strong>{comment.author?.name || 'Usuario'}</strong>
                      <small className="text-muted">{formatDateTime(comment.createdAt)}</small>
                    </div>

                    <div className="mt-1">{highlightMentions(comment.message)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={sendComment} className="card p-3 p-md-4">
            <label className="form-label fw-semibold">Novo comentario</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Digite uma atualizacao da OS. Ex: @joao verificar arte final."
            />

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-primary">Enviar comentario</button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card p-3 p-md-4 timeline-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">Timeline da OS</h5>
                <small className="text-muted">Abra em modal para visualizar o historico completo com scroll.</small>
              </div>
              <span className="badge bg-primary">{timeline.length}</span>
            </div>

            {lastTimelineItem ? (
              <div className="card p-3">
                <small className="text-muted d-block">Ultimo evento</small>
                <strong className="d-block mt-1">{lastTimelineItem.actor?.name || 'Sistema'}</strong>
                <small className="text-muted d-block">{formatDateTime(lastTimelineItem.createdAt)}</small>
                <p className="mb-0 mt-2">
                  {lastTimelineItem.type === 'comment' ? lastTimelineItem.message : localizeStatusTokens(lastTimelineItem.message)}
                </p>
              </div>
            ) : (
              <small className="text-muted">Nenhum historico ainda.</small>
            )}

            <button className="btn btn-outline-primary w-100 mt-3" onClick={() => setTimelineModalOpen(true)}>
              <i className="fa-regular fa-clock me-1" />
              Abrir timeline completa
            </button>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setEditModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-1">Editar Ordem de Servico</h5>
                <small className="text-muted">Atualize os dados principais da OS.</small>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditModalOpen(false)}>Fechar</button>
            </div>

            <form onSubmit={saveOrderChanges}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Titulo</label>
                  <input className="form-control" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" value={editForm.customerId || ''} onChange={e => setEditForm({ ...editForm, customerId: e.target.value })}>
                    <option value="">Sem cliente</option>
                    {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Responsavel</label>
                  <select className="form-select" value={editForm.responsibleEmployeeId || ''} onChange={e => setEditForm({ ...editForm, responsibleEmployeeId: e.target.value })}>
                    <option value="">Sem responsavel</option>
                    {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editForm.status || 'OPEN'} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Prioridade</label>
                  <select className="form-select" value={editForm.priority || 'MEDIUM'} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                    {priorityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Valor total</label>
                  <input className="form-control" type="number" value={editForm.total ?? 0} onChange={e => setEditForm({ ...editForm, total: Number(e.target.value) })} />
                </div>

                <div className="col-12">
                  <label className="form-label">Descricao</label>
                  <textarea className="form-control" rows={4} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditModalOpen(false)}>Cancelar</button>
                <button className="btn btn-success" disabled={editSaving}>{editSaving ? 'Salvando...' : 'Salvar alteracoes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {timelineModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setTimelineModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-1">Timeline da Ordem de Servico</h5>
                <small className="text-muted">Historico completo com scroll.</small>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setTimelineModalOpen(false)}>Fechar</button>
            </div>

            <div className="timeline-modal-scroll">
              <div className="timeline-premium">
                {timeline.length === 0 && <small className="text-muted">Nenhum historico ainda.</small>}

                {Object.entries(groupedTimeline).map(([day, items]: any) => (
                  <div key={day} className="timeline-day-group">
                    <div className="timeline-day-label">{day}</div>

                    {items.map((item: any) => (
                      <div key={item.id} className={`timeline-premium-item timeline-${item.type}`}>
                        <div className="timeline-premium-line" />
                        <div className="timeline-premium-icon"><i className={getTimelineIconClass(item)} /></div>

                        <div className="timeline-premium-content">
                          <div className="d-flex flex-wrap justify-content-between gap-2">
                            <strong>{item.actor?.name || 'Sistema'}</strong>
                            <small className="text-muted">{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</small>
                          </div>

                          <div className="mt-1">
                            {item.type === 'comment' ? highlightMentions(item.message) : localizeStatusTokens(item.message)}
                          </div>

                          {item.oldValue && item.newValue && (
                            <small className="text-muted d-block mt-2">
                              {translateStatusCode(item.oldValue)} -&gt; {translateStatusCode(item.newValue)}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
