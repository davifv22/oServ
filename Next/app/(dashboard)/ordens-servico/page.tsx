"use client"

import { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/service-orders')
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/service-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
  }

  async function onDragEnd(result: any) {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId

    await updateStatus(draggableId, newStatus)

    setOrders(prev =>
      prev.map(o => o.id === draggableId ? { ...o, status: newStatus } : o)
    )
  }

  if (loading) return <Loader label="Carregando..." />

  return (
    <div className="kanban-wrapper">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-scroll">
          {columns.map(col => (
            <Droppable key={col.key} droppableId={col.key}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column">
                  <strong>{col.title}</strong>

                  {orders.filter(o => o.status === col.key).map((order, index) => (
                    <Draggable key={order.id} draggableId={order.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="kanban-card"
                        >
                          <strong>{order.title}</strong>
                          <small className="d-block text-muted">{order.customer?.name}</small>
                          <div className="mt-2">R$ {order.total}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
