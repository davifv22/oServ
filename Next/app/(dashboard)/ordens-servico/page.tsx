"use client"

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

const mockOrders = [
  { id: '1', title: 'Instalação de equipamento', customer: 'Cliente exemplo', status: 'OPEN', priority: 'HIGH', total: 150 },
  { id: '2', title: 'Manutenção preventiva', customer: 'Empresa Teste', status: 'IN_PROGRESS', priority: 'MEDIUM', total: 300 }
]

export default function OrdensServicoKanban() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Ordens de Serviço</h2>
          <p className="text-muted mb-0">Controle visual em Kanban por status</p>
        </div>
        <button className="btn btn-primary">Nova OS</button>
      </div>

      <div className="d-flex gap-3 overflow-auto pb-3">
        {columns.map(column => (
          <section key={column.key} className="kanban-column">
            <div className="kanban-column-header">
              <strong>{column.title}</strong>
              <span className="badge bg-secondary">
                {mockOrders.filter(order => order.status === column.key).length}
              </span>
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
              {mockOrders
                .filter(order => order.status === column.key)
                .map(order => (
                  <article key={order.id} className="kanban-card">
                    <div className="d-flex justify-content-between">
                      <strong>{order.title}</strong>
                      <span className="badge bg-warning text-dark">{order.priority}</span>
                    </div>
                    <small className="text-muted d-block mt-2">{order.customer}</small>
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
