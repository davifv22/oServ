"use client"

import { useEffect, useState } from 'react'
import Toast from '@/components/Toast'

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function highlightMentions(message: string) {
  return message.split(/(@[\w.-]+)/g).map((part, index) => {
    if (part.startsWith('@')) return <strong key={index} className="text-primary">{part}</strong>
    return <span key={index}>{part}</span>
  })
}

function groupByDay(items: any[]) {
  return items.reduce((acc: any, item) => {
    const date = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    acc[date] = acc[date] || []
    acc[date].push(item)
    return acc
  }, {})
}

function getTimelineIcon(item: any) {
  if (item.type === 'comment') return '💬'
  if (item.action === 'STATUS_CHANGED') return '🔄'
  if (item.action === 'CREATED') return '✨'
  if (item.action === 'ASSIGNED') return '👤'
  return '📝'
}

export default function ServiceOrderDetail({ params }: { params: { id: string } }) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

  async function load() {
    setLoading(true)
    const [timelineRes, commentsRes] = await Promise.all([
      fetch(`/api/service-orders/${params.id}/timeline`),
      fetch(`/api/service-orders/${params.id}/comments`)
    ])

    if (timelineRes.ok) setTimeline(await timelineRes.json())
    if (commentsRes.ok) setComments(await commentsRes.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  async function sendComment(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const res = await fetch(`/api/service-orders/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    if (res.ok) {
      setMessage('')
      setToast({ message: 'Comentário enviado', type: 'success' })
      await load()
    } else {
      setToast({ message: 'Erro ao enviar comentário', type: 'error' })
    }
  }

  const groupedTimeline = groupByDay(timeline)

  return (
    <div className="service-order-detail-page">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <a href="/ordens-servico" className="btn btn-sm btn-outline-secondary mb-3">← Voltar para Kanban</a>
          <h2 className="mb-1">Detalhes da Ordem de Serviço</h2>
          <p className="text-muted mb-0">Comentários, interação da equipe e timeline completa da OS.</p>
        </div>

        <div className="card p-3 service-order-summary-card">
          <small className="text-muted">Identificador da OS</small>
          <strong className="text-break">{params.id}</strong>
          <small className="text-muted mt-2">{loading ? 'Sincronizando...' : 'Atualização automática ativa'}</small>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card p-3 p-md-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">Comentários</h5>
                <small className="text-muted">Use @nome para mencionar alguém da equipe.</small>
              </div>
              <span className="badge bg-secondary">{comments.length}</span>
            </div>

            <div className="comments-list">
              {comments.length === 0 && <small className="text-muted">Nenhum comentário ainda.</small>}
              {comments.map(comment => (
                <div key={comment.id} className="comment-bubble-row">
                  <span className="responsible-avatar">{initials(comment.author?.name)}</span>
                  <div className="comment-bubble">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                      <strong>{comment.author?.name || 'Usuário'}</strong>
                      <small className="text-muted">{new Date(comment.createdAt).toLocaleString('pt-BR')}</small>
                    </div>
                    <div className="mt-1">{highlightMentions(comment.message)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={sendComment} className="card p-3 p-md-4">
            <label className="form-label fw-semibold">Novo comentário</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Digite uma atualização da OS. Ex: @joao verificar arte final."
            />
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-primary">Enviar comentário</button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card p-3 p-md-4 timeline-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">Timeline da OS</h5>
                <small className="text-muted">Histórico premium de ações e conversas.</small>
              </div>
              <span className="badge bg-primary">{timeline.length}</span>
            </div>

            <div className="timeline-premium">
              {timeline.length === 0 && <small className="text-muted">Nenhum histórico ainda.</small>}

              {Object.entries(groupedTimeline).map(([day, items]: any) => (
                <div key={day} className="timeline-day-group">
                  <div className="timeline-day-label">{day}</div>

                  {items.map((item: any) => (
                    <div key={item.id} className={`timeline-premium-item timeline-${item.type}`}>
                      <div className="timeline-premium-line" />
                      <div className="timeline-premium-icon">{getTimelineIcon(item)}</div>
                      <div className="timeline-premium-content">
                        <div className="d-flex flex-wrap justify-content-between gap-2">
                          <strong>{item.actor?.name || 'Sistema'}</strong>
                          <small className="text-muted">{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</small>
                        </div>
                        <div className="mt-1">
                          {item.type === 'comment' ? highlightMentions(item.message) : item.message}
                        </div>
                        {item.oldValue && item.newValue && (
                          <small className="text-muted d-block mt-2">{item.oldValue} → {item.newValue}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
