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
      <form onSubmit={handleLogin} className="card p-4 shadow-sm" style={{ width: 340 }}>
        <h4 className="mb-1">Login</h4>
        <p className="text-muted small mb-3">Acesse sua empresa no oServ.</p>

        <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />

        {error && <small className="text-danger d-block mb-2">{error}</small>}

        <button className="btn btn-primary mt-2 w-100" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>

        <div className="text-center mt-3">
          <small className="text-muted d-block mb-2">Ainda não tem uma conta?</small>
          <a href="/registro" className="btn btn-outline-success w-100">Registrar empresa</a>
        </div>
      </form>
    </div>
  )
}
