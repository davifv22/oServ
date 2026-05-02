"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

type ServiceOrder = {
  id: string
  title?: string
  description?: string | null
  status: string
  priority?: string
  total?: number
  customer?: { name?: string }
  responsibleEmployee?: { name?: string }
  comments?: { id: string }[]
  responsibleEmployeeId?: string | null
}

type ColumnProps = {
  keyId: string
  title: string
  orders: ServiceOrder[]
}

function OrderCardContent({ order }: { order: ServiceOrder }) {
  return (
    <>
      <div className="d-flex justify-content-between gap-2">
        <strong className="text-truncate">{order.title || 'Sem titulo'}</strong>
        <span className="badge bg-warning badge-contrast">{order.priority || 'MEDIUM'}</span>
      </div>
      <small className="d-block text-muted mt-1 text-truncate">Cliente: {order.customer?.name || 'Sem cliente'}</small>
      <small className="d-block text-muted text-truncate">Responsavel: {order.responsibleEmployee?.name || 'Sem responsavel'}</small>
      {order.description && <small className="d-block mt-1 text-muted text-truncate">Descricao: {order.description}</small>}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <span className="fw-semibold">R$ {Number(order.total || 0).toFixed(2)}</span>
        <span className="badge bg-secondary">Comentarios: {order.comments?.length || 0}</span>
      </div>
      <Button variant="outline" size="sm" className="mt-2 w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" asChild>
        <a href={`/ordens-servico/${order.id}`} draggable={false}>Abrir OS</a>
      </Button>
    </>
  )
}

function DraggableOrderCard({ order }: { order: ServiceOrder }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { status: order.status }
  })

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.35 : 1
  }

  return (
    <article ref={setNodeRef} style={style} className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}>
      <div className="kanban-card-grab" {...listeners} {...attributes}>
        <i className="fa-solid fa-grip-lines me-1" />
        Segure e arraste
      </div>
      <OrderCardContent order={order} />
    </article>
  )
}

function DroppableColumn({ keyId, title, orders }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: keyId })

  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? 'kanban-column-active' : ''}`}>
      <div className="kanban-column-header">
        <strong>{title}</strong>
        <span className="badge bg-secondary">{orders.length}</span>
      </div>
      <div className="kanban-column-body">
        {orders.map(order => (
          <DraggableOrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  )
}

export default function Kanban() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('ALL')
  const [responsible, setResponsible] = useState('ALL')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<any>({ priority: 'MEDIUM', total: 0 })
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const interactionLockRef = useRef(false)
  const loadErrorShownRef = useRef(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  )

  async function load(showLoader = false, force = false) {
    if ((interactionLockRef.current || loadingRef.current) && !force) return

    if (showLoader) setLoading(true)
    loadingRef.current = true
    setSyncing(true)

    try {
      const [ordersRes, employeesRes, customersRes, servicesRes] = await Promise.all([
        fetch('/api/service-orders', { cache: 'no-store' }),
        fetch('/api/employees', { cache: 'no-store' }),
        fetch('/api/customers', { cache: 'no-store' }),
        fetch('/api/services', { cache: 'no-store' })
      ])

      const allOk = ordersRes.ok && employeesRes.ok && customersRes.ok && servicesRes.ok
      if (!allOk) {
        if (!loadErrorShownRef.current) {
          setToast({ message: 'Erro ao carregar dados das ordens de servico', type: 'error' })
          loadErrorShownRef.current = true
        }
      } else {
        loadErrorShownRef.current = false
      }

      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (employeesRes.ok) setEmployees(await employeesRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())

      setLastSync(new Date())
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Erro de conexao ao carregar ordens de servico', type: 'error' })
        loadErrorShownRef.current = true
      }
    } finally {
      loadingRef.current = false
      setSyncing(false)
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    void load(true, true)
    const interval = setInterval(() => {
      void load(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    interactionLockRef.current = Boolean(activeOrderId || saving || updatingStatus)
  }, [activeOrderId, saving, updatingStatus])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const text = `${order.title || ''} ${order.customer?.name || ''}`.toLowerCase()
      return text.includes(search.toLowerCase()) &&
        (priority === 'ALL' || order.priority === priority) &&
        (responsible === 'ALL' || order.responsibleEmployeeId === responsible)
    })
  }, [orders, search, priority, responsible])

  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null
    return orders.find(order => order.id === activeOrderId) || null
  }, [activeOrderId, orders])

  async function exportOrdersPdf() {
    if (orders.length === 0) {
      setToast({ message: 'Nenhuma ordem de serviço para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Ordens de Serviço',
      ['Título', 'Status', 'Prioridade', 'Cliente', 'Responsável', 'Total'],
      ['title', 'status', 'priority', 'customer', 'responsible', 'total'],
      orders.map(order => ({
        title: order.title || '-',
        status: order.status || '-',
        priority: order.priority || '-',
        customer: order.customer?.name || '-',
        responsible: order.responsibleEmployee?.name || '-',
        total: `R$ ${Number(order.total || 0).toFixed(2).replace('.', ',')}`
      })),
      'ordens-servico.pdf'
    )
  }

  function openNewOrderModal() {
    setForm({ priority: 'MEDIUM', total: 0 })
    setModalOpen(true)
  }

  function handleSelectService(serviceId: string) {
    const service = services.find(item => item.id === serviceId)
    setForm((prev: any) => ({ ...prev, serviceId, title: prev.title || service?.name || '', total: service?.price || 0 }))
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.customerId) {
      setToast({ message: 'Informe titulo e cliente para criar a OS', type: 'error' })
      return
    }

    setSaving(true)
    const response = await fetch('/api/service-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)

    if (response.ok) {
      setToast({ message: 'OS criada com sucesso', type: 'success' })
      setModalOpen(false)
      setForm({ priority: 'MEDIUM', total: 0 })
      await load(false, true)
    } else {
      setToast({ message: 'Erro ao criar OS', type: 'error' })
    }
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch('/api/service-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })

    if (!response.ok) {
      setToast({ message: 'Erro ao atualizar status da OS', type: 'error' })
      return false
    }

    return true
  }

  function onDragStart(event: DragStartEvent) {
    setActiveOrderId(String(event.active.id))
  }

  async function onDragEnd(event: DragEndEvent) {
    const currentActiveId = activeOrderId
    setActiveOrderId(null)

    if (!event.over) return

    const newStatus = String(event.over.id)
    if (!columns.some(col => col.key === newStatus)) return

    const draggableId = currentActiveId || String(event.active.id)
    const current = orders.find(order => order.id === draggableId)
    if (!current || current.status === newStatus) return

    setOrders(prev => prev.map(order => (order.id === draggableId ? { ...order, status: newStatus } : order)))

    setUpdatingStatus(true)
    let ok = false
    try {
      ok = await updateStatus(draggableId, newStatus)
    } finally {
      setUpdatingStatus(false)
    }

    if (ok) {
      setToast({ message: 'Status atualizado', type: 'success' })
      await load(false, true)
    } else {
      setOrders(prev => prev.map(order => (order.id === draggableId ? { ...order, status: current.status } : order)))
    }
  }

  if (loading) return <Loader label="Carregando ordens de servico..." />

  return (
    <div className="kanban-wrapper">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h2 className="mb-1">Ordens de Servico</h2>
          <small className="text-muted">
            {syncing ? 'Sincronizando...' : lastSync ? `Atualizado as ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando sincronizacao'}
          </small>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportOrdersPdf()}>Exportar PDF</Button>
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load(false, true)}>Atualizar agora</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNewOrderModal}>+ Nova OS</Button>
        </div>
      </div>

      <div className="card p-3 mb-3 kanban-filter-card">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Buscar</label>
            <input className="form-control" placeholder="OS ou cliente" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Prioridade</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="ALL">Todas</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Responsavel</label>
            <select className="form-select" value={responsible} onChange={e => setResponsible(e.target.value)}>
              <option value="ALL">Todos</option>
              {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <Button variant="outline" className="w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => { setSearch(''); setPriority('ALL'); setResponsible('ALL') }}>
              Limpar
            </Button>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={event => void onDragEnd(event)}>
        <div className="kanban-scroll">
          {columns.map(col => (
            <DroppableColumn
              key={col.key}
              keyId={col.key}
              title={col.title}
              orders={filteredOrders.filter(order => order.status === col.key)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder ? (
            <article className="kanban-card kanban-card-dragging kanban-card-overlay">
              <div className="kanban-card-grab">
                <i className="fa-solid fa-grip-lines me-1" />
                Movendo...
              </div>
              <OrderCardContent order={activeOrder} />
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-1">Nova Ordem de Servico</h5>
                <small className="text-muted">Preencha os dados para abrir uma nova OS no Kanban.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setModalOpen(false)}>Fechar</Button>
            </div>

            <form onSubmit={createOrder}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Titulo</label>
                  <input className="form-control" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" value={form.customerId || ''} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                    <option value="">Selecione</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Servico</label>
                  <select className="form-select" value={form.serviceId || ''} onChange={e => handleSelectService(e.target.value)}>
                    <option value="">Selecione</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Responsavel</label>
                  <select className="form-select" value={form.responsibleEmployeeId || ''} onChange={e => setForm({ ...form, responsibleEmployeeId: e.target.value })}>
                    <option value="">Sem responsavel</option>
                    {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Prioridade</label>
                  <select className="form-select" value={form.priority || 'MEDIUM'} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valor</label>
                  <input className="form-control" type="number" value={form.total || 0} onChange={e => setForm({ ...form, total: Number(e.target.value) })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status inicial</label>
                  <select className="form-select" value={form.status || 'OPEN'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {columns.map(col => <option key={col.key} value={col.key}>{col.title}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Descricao</label>
                  <textarea className="form-control" rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={saving}>{saving ? 'Salvando...' : 'Criar OS'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
