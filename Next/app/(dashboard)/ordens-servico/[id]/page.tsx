"use client"

import { useEffect, useState } from 'react'

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function ServiceOrderDetail({ params }: { params: { id: string } }) {
  const [timeline, setTimeline] = useState<any[]>([])

  async function load() {
    const res = await fetch(`/api/service-orders/${params.id}/timeline`)
    if (res.ok) setTimeline(await res.json())
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  return (
    <div>
      <h2>Timeline da OS</h2>

      <div className="timeline">
        {timeline.map(item => (
          <div key={item.id} className="timeline-item">
            <div className="timeline-avatar">{item.actor ? initials(item.actor.name) : '?'}</div>

            <div className="timeline-content">
              <div className="d-flex justify-content-between">
                <strong>{item.actor?.name || 'Sistema'}</strong>
                <small>{new Date(item.createdAt).toLocaleString('pt-BR')}</small>
              </div>

              {item.type === 'audit' && (
                <div className="text-muted">{item.message}</div>
              )}

              {item.type === 'comment' && (
                <div>{item.message}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
