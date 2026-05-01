"use client"

import { useEffect, useState } from 'react'

export default function NotificationBell() {
  const [items, setItems] = useState<any[]>([])

  async function load() {
    const res = await fetch('/api/notifications')
    if (res.ok) setItems(await res.json())
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  const unread = items.filter(i => !i.readAt).length

  async function markAll() {
    await fetch('/api/notifications', { method: 'PATCH' })
    load()
  }

  return (
    <div className="position-relative">
      <button className="btn btn-light" onClick={markAll}>
        🔔 {unread > 0 && <span className="badge bg-danger">{unread}</span>}
      </button>

      <div className="card position-absolute mt-2" style={{ right: 0, width: 300, zIndex: 10 }}>
        {items.length === 0 && <small className="p-2 text-muted">Sem notificações</small>}
        {items.map(n => (
          <div key={n.id} className="p-2 border-bottom">
            <strong>{n.title}</strong>
            <div className="small text-muted">{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
