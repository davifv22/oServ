"use client"

import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
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
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('ALL')
  const [responsible, setResponsible] = useState('ALL')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  async function load(showLoader = false) {
    if (showLoader) setLoading(true)
    setSyncing(true)

    const [ordersRes, employeesRes] = await Promise.all([
      fetch('/api/service-orders'),
      fetch('/api/employees')
    ])

    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (employeesRes.ok) setEmployees(await employeesRes.json())

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
      const matchesSearch = text.includes(search.toLowerCase())
      const matchesPriority = priority === 'ALL' || order.priority === priority
      const matchesResponsible = responsible === 'ALL' || order.responsibleEmployeeId === responsible
      return matchesSearch && matchesPriority && matchesResponsible
    })
  }, [orders, search, priority, responsible])

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
          <small className="text-muted">
            {syncing ? 'Sincronizando...' : lastSync ? `Atualizado às ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando sincronização'}
          </small>
        </div>

        <button className="btn btn-outline-primary" onClick={() => load(false)}>
          Atualizar agora
        </button>
      </div>

      <div className="card p-3 mb-3">
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
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Responsável</label>
            <select className="form-select" value={responsible} onChange={e => setResponsible(e.target.value)}>
              <option value="ALL">Todos</option>
              {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
          </div>

          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setPriority('ALL'); setResponsible('ALL') }}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-scroll">
          {columns.map(col => {
            const columnOrders = filteredOrders.filter(order => order.status === col.key)

            return (
              <Droppable key={col.key} droppableId={col.key}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`kanban-column ${snapshot.isDraggingOver ? 'kanban-column-active' : ''}`}>
                    <div className="kanban-column-header">
                      <strong>{col.title}</strong>
                      <span className="badge bg-secondary">{columnOrders.length}</span>
                    </div>

                    {columnOrders.map((order, index) => (
                      <Draggable key={order.id} draggableId={order.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}
                          >
                            <div className="d-flex justify-content-between gap-2">
                              <strong>{order.title}</strong>
                              <span className="badge bg-warning text-dark">{order.priority}</span>
                            </div>
                            <small className="d-block text-muted mt-2">{order.customer?.name || 'Sem cliente'}</small>
                            <small className="d-block text-muted">Responsável: {order.responsibleEmployee?.name || 'Sem responsável'}</small>
                            <div className="mt-2">R$ {Number(order.total || 0).toFixed(2)}</div>
                            <a className="btn btn-sm btn-outline-primary mt-2" href={`/ordens-servico/${order.id}`}>Abrir</a>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
