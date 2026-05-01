"use client"

import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

export default function Kanban() {
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('ALL')
  const [responsible, setResponsible] = useState('ALL')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<any>({ priority: 'MEDIUM', total: 0 })

  async function load(showLoader = false) {
    if (showLoader) setLoading(true)
    setSyncing(true)

    const [ordersRes, employeesRes, customersRes, servicesRes] = await Promise.all([
      fetch('/api/service-orders'),
      fetch('/api/employees'),
      fetch('/api/customers'),
      fetch('/api/services')
    ])

    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (employeesRes.ok) setEmployees(await employeesRes.json())
    if (customersRes.ok) setCustomers(await customersRes.json())
    if (servicesRes.ok) setServices(await servicesRes.json())

    setLastSync(new Date())
    setSyncing(false)
    if (showLoader) setLoading(false)
  }

  useEffect(() => {
    load(true)
    const interval = setInterval(() => load(false), 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const text = `${order.title || ''} ${order.customer?.name || ''}`.toLowerCase()
      return text.includes(search.toLowerCase()) &&
        (priority === 'ALL' || order.priority === priority) &&
        (responsible === 'ALL' || order.responsibleEmployeeId === responsible)
    })
  }, [orders, search, priority, responsible])

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
      setToast({ message: 'Informe título e cliente para criar a OS', type: 'error' })
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
      await load(false)
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

  async function onDragEnd(result: any) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId
    const current = orders.find(order => order.id === draggableId)
    if (!current || current.status === newStatus) return
    setOrders(prev => prev.map(order => order.id === draggableId ? { ...order, status: newStatus } : order))
    const ok = await updateStatus(draggableId, newStatus)
    if (ok) {
      setToast({ message: 'Status atualizado', type: 'success' })
      load(false)
    } else {
      setOrders(prev => prev.map(order => order.id === draggableId ? { ...order, status: current.status } : order))
    }
  }

  if (loading) return <Loader label="Carregando ordens de serviço..." />

  return (
    <div className="kanban-wrapper">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h2 className="mb-1">Ordens de Serviço</h2>
          <small className="text-muted">{syncing ? 'Sincronizando...' : lastSync ? `Atualizado às ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando sincronização'}</small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary" onClick={() => load(false)}>Atualizar agora</button>
          <button className="btn btn-primary" onClick={openNewOrderModal}>+ Nova OS</button>
        </div>
      </div>

      <div className="card p-3 mb-3 kanban-filter-card">
        <div className="row g-2 align-items-end">
          <div className="col-md-4"><label className="form-label">Buscar</label><input className="form-control" placeholder="OS ou cliente" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="col-md-3"><label className="form-label">Prioridade</label><select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}><option value="ALL">Todas</option><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></div>
          <div className="col-md-3"><label className="form-label">Responsável</label><select className="form-select" value={responsible} onChange={e => setResponsible(e.target.value)}><option value="ALL">Todos</option>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></div>
          <div className="col-md-2"><button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setPriority('ALL'); setResponsible('ALL') }}>Limpar</button></div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-scroll">
          {columns.map(col => {
            const columnOrders = filteredOrders.filter(order => order.status === col.key)
            return (
              <Droppable key={col.key} droppableId={col.key}>
                {(provided, snapshot) => (
                  <section ref={provided.innerRef} {...provided.droppableProps} className={`kanban-column ${snapshot.isDraggingOver ? 'kanban-column-active' : ''}`}>
                    <div className="kanban-column-header"><strong>{col.title}</strong><span className="badge bg-secondary">{columnOrders.length}</span></div>
                    <div className="kanban-column-body">
                      {columnOrders.map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <article ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}>
                              <div className="d-flex justify-content-between gap-2">
                                <strong className="text-truncate">{order.title}</strong>
                                <span className="badge bg-warning text-dark">{order.priority}</span>
                              </div>
                              <small className="d-block text-muted mt-1 text-truncate">👤 {order.customer?.name || 'Sem cliente'}</small>
                              <small className="d-block text-muted text-truncate">🛠 {order.responsibleEmployee?.name || 'Sem responsável'}</small>
                              {order.description && <small className="d-block mt-1 text-muted text-truncate">📝 {order.description}</small>}
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <span className="fw-semibold">R$ {Number(order.total || 0).toFixed(2)}</span>
                                <span className="badge bg-secondary">💬 {order.comments?.length || 0}</span>
                              </div>
                              <a className="btn btn-sm btn-outline-primary mt-2 w-100" href={`/ordens-servico/${order.id}`}>Abrir OS</a>
                            </article>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {modalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-card modal-card-lg">
            <div className="d-flex justify-content-between align-items-start mb-3"><div><h5 className="mb-1">Nova Ordem de Serviço</h5><small className="text-muted">Preencha os dados para abrir uma nova OS no Kanban.</small></div><button className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)}>Fechar</button></div>
            <form onSubmit={createOrder}>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Título</label><input className="form-control" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Cliente</label><select className="form-select" value={form.customerId || ''} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">Selecione</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="col-md-6"><label className="form-label">Serviço</label><select className="form-select" value={form.serviceId || ''} onChange={e => handleSelectService(e.target.value)}><option value="">Selecione</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className="col-md-6"><label className="form-label">Responsável</label><select className="form-select" value={form.responsibleEmployeeId || ''} onChange={e => setForm({ ...form, responsibleEmployeeId: e.target.value })}><option value="">Sem responsável</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                <div className="col-md-4"><label className="form-label">Prioridade</label><select className="form-select" value={form.priority || 'MEDIUM'} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></div>
                <div className="col-md-4"><label className="form-label">Valor</label><input className="form-control" type="number" value={form.total || 0} onChange={e => setForm({ ...form, total: Number(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Status inicial</label><select className="form-select" value={form.status || 'OPEN'} onChange={e => setForm({ ...form, status: e.target.value })}>{columns.map(col => <option key={col.key} value={col.key}>{col.title}</option>)}</select></div>
                <div className="col-12"><label className="form-label">Descrição</label><textarea className="form-control" rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button className="btn btn-success" disabled={saving}>{saving ? 'Salvando...' : 'Criar OS'}</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
