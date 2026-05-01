"use client"

import { useEffect, useRef, useState } from 'react'

export default function NotificationBell() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  async function load() {
    const res = await fetch('/api/notifications')
    if (res.ok) setItems(await res.json())
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unread = items.filter(i => !i.readAt).length

  async function markAll() {
    await fetch('/api/notifications', { method: 'PATCH' })
    await load()
  }

  return (
    <div className="position-relative" ref={wrapperRef}>
      <button className="btn btn-light position-relative" onClick={() => setOpen(prev => !prev)}>
        🔔
        {unread > 0 && <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">{unread}</span>}
      </button>

      {open && (
        <div className="card position-absolute mt-2 shadow notification-dropdown">
          <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
            <strong>Notificações</strong>
            <button className="btn btn-sm btn-outline-secondary" onClick={markAll}>Marcar lidas</button>
          </div>
          <div className="notification-list">
            {items.length === 0 && <small className="p-3 text-muted d-block">Sem notificações</small>}
            {items.map(n => (
              <div key={n.id} className="p-3 border-bottom">
                <strong>{n.title}</strong>
                <div className="small text-muted">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
