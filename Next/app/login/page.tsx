"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setToast(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao logar')

      window.location.href = data.redirectTo || '/dashboard'
    } catch (err: any) {
      const message = err.message || 'Erro ao logar'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleLogin} className="auth-card card p-4 shadow-sm" style={{ width: 360 }}>
        <div className="text-center mb-3">
          <img src="/logo.png" alt="oServ - Gestão ordem de serviços" style={{ maxWidth: 170, height: 'auto' }} />
          <small className="text-muted d-block mt-2">Gestão ordem de serviços</small>
        </div>

        <h4 className="mb-1">Login</h4>
        <p className="text-muted small mb-3">Acesse sua empresa no oServ.</p>

        <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />

        <label className="form-check mb-2 d-flex align-items-center gap-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <span className="form-check-label small">Lembrar de mim por 30 dias</span>
        </label>

        {error && <small className="text-danger d-block mb-2">{error}</small>}

        <Button type="submit" className="w-full mt-2 bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>

        <div className="text-center mt-3">
          <small className="text-muted d-block mb-2">Ainda nao tem uma conta?</small>
          <Button variant="outline" className="w-full bg-transparent border-green-600 text-green-600 hover:bg-green-50" asChild>
            <a href="/registro">Registrar empresa</a>
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
