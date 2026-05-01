"use client"

import { useEffect, useState } from 'react'

type Comment = {
  id: string
  message: string
  createdAt: string
  author: { name: string }
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function highlightMentions(message: string) {
  return message.split(/(@[\w.-]+)/g).map((part, index) => {
    if (part.startsWith('@')) {
      return <strong key={index} className="text-primary">{part}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

export default function ServiceOrderDetail({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState('')
  const [comments, setComments] = useState<Comment[]>([])

  async function loadComments() {
    const res = await fetch(`/api/service-orders/${params.id}/comments`)
    if (res.ok) setComments(await res.json())
  }

  useEffect(() => {
    loadComments()
    const interval = setInterval(loadComments, 5000)
    return () => clearInterval(interval)
  }, [])

  async function sendComment(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    await fetch(`/api/service-orders/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    setMessage('')
    loadComments()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>Detalhes da Ordem de Serviço</h2>
          <p className="text-muted mb-0">Histórico, comentários e acompanhamento da execução.</p>
        </div>
        <a href="/ordens-servico" className="btn btn-outline-secondary">Voltar</a>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card p-3 mb-3">
            <h5>Comentários</h5>
            <div className="d-flex flex-column gap-3 mt-3">
              {comments.length === 0 && <small className="text-muted">Nenhum comentário ainda.</small>}
              {comments.map(comment => (
                <div key={comment.id} className="d-flex gap-2">
                  <span className="responsible-avatar">{initials(comment.author.name)}</span>
                  <div className="bg-light rounded p-2 flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>{comment.author.name}</strong>
                      <small className="text-muted">{new Date(comment.createdAt).toLocaleString('pt-BR')}</small>
                    </div>
                    <div>{highlightMentions(comment.message)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={sendComment} className="card p-3">
            <label className="form-label">Novo comentário</label>
            <textarea className="form-control" rows={3} placeholder="Digite uma mensagem. Use @nome para mencionar alguém." value={message} onChange={e => setMessage(e.target.value)} />
            <div className="text-end mt-2">
              <button className="btn btn-primary">Enviar comentário</button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card p-3">
            <h5>Resumo</h5>
            <p className="text-muted mb-1">Status, prioridade, responsável e cliente serão carregados da API da OS.</p>
            <small className="text-muted">ID: {params.id}</small>
          </div>
        </div>
      </div>
    </div>
  )
}
