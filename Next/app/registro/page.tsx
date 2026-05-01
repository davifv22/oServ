"use client"

import { useState } from 'react'

export default function Registro() {
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: any) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, subdomain })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar empresa')
      }

      window.location.href = '/login'
    } catch (err: any) {
      setError(err.message || 'Erro ao criar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form onSubmit={handleRegister} className="card p-4 shadow-sm" style={{ width: 420 }}>
        <h4 className="mb-1">Criar empresa</h4>
        <p className="text-muted small mb-3">Cadastre sua empresa e escolha o subdomínio do sistema.</p>

        <input className="form-control mb-2" placeholder="Nome da empresa" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
        <input className="form-control mb-2" type="email" placeholder="Email do administrador" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="form-control mb-2" placeholder="Subdomínio" value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
        <small className="text-muted mb-2 d-block">Exemplo: {subdomain || 'minhaempresa'}.localhost:3000</small>
        <input type="password" className="form-control mb-2" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />

        {error && <small className="text-danger d-block mb-2">{error}</small>}

        <button className="btn btn-success" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
        <a href="/login" className="text-center small mt-3">Já tenho conta</a>
      </form>
    </div>
  )
}
