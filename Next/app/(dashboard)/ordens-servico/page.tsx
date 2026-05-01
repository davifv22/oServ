"use client"

import { useState } from 'react'

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

const mockCustomers = [
  { id: '1', name: 'Cliente exemplo' },
  { id: '2', name: 'Empresa Teste' }
]

const mockEmployees = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Souza' }
]

const mockServices = [
  { id: '1', name: 'Instalação', price: 150 },
  { id: '2', name: 'Manutenção preventiva', price: 300 }
]

const mockOrders = [
  { id: '1', title: 'Instalação de equipamento', customer: 'Cliente exemplo', responsible: 'João Silva', status: 'OPEN', priority: 'HIGH', total: 150 },
  { id: '2', title: 'Manutenção preventiva', customer: 'Empresa Teste', responsible: 'Maria Souza', status: 'IN_PROGRESS', priority: 'MEDIUM', total: 300 }
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export default function OrdensServicoKanban() {
  const [showForm, setShowForm] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [total, setTotal] = useState(0)

  function handleSelectService(id: string) {
    setServiceId(id)
    const service = mockServices.find(item => item.id === id)
    setTotal(service?.price || 0)
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
        <div className="card p-3 mb-4">
          <h5>Nova Ordem de Serviço</h5>
          <div className="row g-2">
            <div className="col-md-6"><input className="form-control" placeholder="Título da OS" /></div>
            <div className="col-md-6">
              <select className="form-select">
                <option>Selecione o cliente</option>
                {mockCustomers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <select className="form-select" value={serviceId} onChange={e => handleSelectService(e.target.value)}>
                <option value="">Selecione o serviço</option>
                {mockServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <select className="form-select">
                <option>Selecione o responsável</option>
                {mockEmployees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" type="number" value={total} onChange={e => setTotal(Number(e.target.value))} /></div>
            <div className="col-12"><textarea className="form-control" placeholder="Descrição detalhada do serviço" rows={3}></textarea></div>
            <div className="col-12 text-end">
              <button className="btn btn-outline-secondary me-2" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-success">Salvar OS</button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-3 overflow-auto pb-3">
        {columns.map(column => (
          <section key={column.key} className="kanban-column">
            <div className="kanban-column-header">
              <strong>{column.title}</strong>
              <span className="badge bg-secondary">{mockOrders.filter(order => order.status === column.key).length}</span>
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
              {mockOrders.filter(order => order.status === column.key).map(order => (
                <article key={order.id} className="kanban-card">
                  <div className="d-flex justify-content-between">
                    <strong>{order.title}</strong>
                    <span className="badge bg-warning text-dark">{order.priority}</span>
                  </div>
                  <small className="text-muted d-block mt-2">{order.customer}</small>
                  <div className="d-flex align-items-center gap-2 mt-3">
                    <span className="responsible-avatar">{getInitials(order.responsible)}</span>
                    <small className="text-muted">{order.responsible}</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span>R$ {order.total.toFixed(2)}</span>
                    <button className="btn btn-sm btn-outline-primary">Abrir</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
