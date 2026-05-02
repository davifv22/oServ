"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="auth-card w-full max-w-sm border-app-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
            <img src="/logo.png" alt="oServ - Gestao ordem de servicos" className="h-auto w-[170px]" />
            <small className="text-muted-foreground">Gestao ordem de servicos</small>
          </div>
          <div>
            <CardTitle className="text-2xl">Login</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Acesse sua empresa no oServ.</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              Lembrar de mim por 30 dias
            </label>

            {error && <small className="block text-sm text-red-400">{error}</small>}

            <Button type="submit" className="w-full bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="pt-3 text-center">
              <small className="block text-muted-foreground mb-2">Ainda nao tem uma conta?</small>
              <Button variant="outline" className="w-full bg-transparent border-emerald-500/70 text-emerald-300 hover:bg-emerald-500/10" asChild>
                <a href="/registro">Registrar empresa</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
