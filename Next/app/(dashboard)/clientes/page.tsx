"use client"

import { useState } from 'react'

export default function Clientes() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    })

    setName('')
    setEmail('')
    setPhone('')
  }

  return (
    <div>
      <h2>Clientes</h2>
      <p className="text-muted">Cadastro de clientes da empresa.</p>

      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4"><input className="form-control" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="col-md-4"><input className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="col-md-3"><input className="form-control" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="col-md-1"><button className="btn btn-primary w-100">Salvar</button></div>
        </div>
      </form>
    </div>
  )
}
