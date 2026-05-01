"use client"

import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

function getInitials(name?: string) {
  if (!name) return '--'
  return name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase()
}

export default function OrdensServicoKanban() {
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [form, setForm] = useState<any>({ priority: 'MEDIUM', total: 0 })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

  async function load() {
    setLoading(true)
    const [ordersRes, customersRes, employeesRes, servicesRes] = await Promise.all([
      fetch('/api/service-orders'),
      fetch('/api/customers'),
      fetch('/api/employees'),
      fetch('/api/services')
    ])
    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (customersRes.ok) setCustomers(await customersRes.json())
    if (employeesRes.ok) setEmployees(await employeesRes.json())
    if (servicesRes.ok) setServices(await servicesRes.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  function handleSelectService(id: string) {
    const service = services.find(item => item.id === id)
    setForm({ ...form, serviceId: id, total: service?.price || 0, title: form.title || service?.name || '' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/service-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (response.ok) {
      setToast({ message: 'OS criada com sucesso', type: 'success' })
      setShowForm(false)
      setForm({ priority: 'MEDIUM', total: 0 })
      load()
    } else {
      setToast({ message: 'Erro ao criar OS', type: 'error' })
    }
  }

  async function move(id: string, status: string) {
    const response = await fetch('/api/service-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })

    if (response.ok) {
      setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order))
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Ordens de Serviço</h2>
          <p className="text-muted mb-0">Controle visual em Kanban por status</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>Nova OS</button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-3 mb-4">
          <h5>Nova Ordem de Serviço</h5>
          <div className="row g-2">
            <div className="col-md-6"><input className="form-control" placeholder="Título da OS" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="col-md-6">
              <select className="form-select" value={form.customerId || ''} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Selecione o cliente</option>
                {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <select className="form-select" value={form.serviceId || ''} onChange={e => handleSelectService(e.target.value)}>
                <option value="">Selecione o serviço</option>
                {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <select className="form-select" value={form.responsibleEmployeeId || ''} onChange={e => setForm({ ...form, responsibleEmployeeId: e.target.value })}>
                <option value="">Selecione o responsável</option>
                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" type="number" value={form.total || 0} onChange={e => setForm({ ...form, total: Number(e.target.value) })} /></div>
            <div className="col-12"><textarea className="form-control" placeholder="Descrição detalhada do serviço" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}></textarea></div>
            <div className="col-12 text-end">
              <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-success">Salvar OS</button>
            </div>
          </div>
        </form>
      )}

      {loading ? <Loader label="Carregando ordens de serviço..." /> : (
        <div className="d-flex gap-3 overflow-auto pb-3">
          {columns.map(column => (
            <section key={column.key} className="kanban-column">
              <div className="kanban-column-header">
                <strong>{column.title}</strong>
                <span className="badge bg-secondary">{orders.filter(order => order.status === column.key).length}</span>
              </div>

              <div className="d-flex flex-column gap-3 mt-3">
                {orders.filter(order => order.status === column.key).map(order => (
                  <article key={order.id} className="kanban-card">
                    <div className="d-flex justify-content-between">
                      <strong>{order.title}</strong>
                      <span className="badge bg-warning text-dark">{order.priority}</span>
                    </div>
                    <small className="text-muted d-block mt-2">{order.customer?.name || 'Sem cliente'}</small>
                    <div className="d-flex align-items-center gap-2 mt-3">
                      <span className="responsible-avatar">{getInitials(order.responsibleEmployee?.name)}</span>
                      <small className="text-muted">{order.responsibleEmployee?.name || 'Sem responsável'}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span>R$ {Number(order.total || 0).toFixed(2)}</span>
                      <a className="btn btn-sm btn-outline-primary" href={`/ordens-servico/${order.id}`}>Abrir</a>
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      {columns.filter(c => c.key !== order.status).map(c => (
                        <button key={c.key} className="btn btn-sm btn-outline-secondary" onClick={() => move(order.id, c.key)}>{c.title}</button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
