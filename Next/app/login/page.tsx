"use client"

import { useState } from 'react'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: any) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      })

      if (!res.ok) throw await res.json()

      const data = await res.json()

      sessionStorage.setItem('is_logged_in', 'true')
      sessionStorage.setItem('user', data.user)

      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || 'Erro ao logar')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleLogin} className="card p-4" style={{ width: 300 }}>
        <h4 className="mb-3">Login</h4>

        <input className="form-control mb-2" placeholder="Usuário" value={usuario} onChange={e => setUsuario(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />

        {error && <small className="text-danger">{error}</small>}

        <button className="btn btn-primary mt-2">Entrar</button>
      </form>
    </div>
  )
}
