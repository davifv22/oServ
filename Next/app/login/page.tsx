"use client"

import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao logar')

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Erro ao logar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form onSubmit={handleLogin} className="card p-4 shadow-sm" style={{ width: 320 }}>
        <h4 className="mb-3">Login</h4>

        <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />

        {error && <small className="text-danger">{error}</small>}

        <button className="btn btn-primary mt-2" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>

        <a href="/registro" className="text-center small mt-3 d-block">Criar conta</a>
      </form>
    </div>
  )
}
