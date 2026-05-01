"use client"

import { useState } from 'react'

export default function Registro() {
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')

  const handleRegister = async (e: any) => {
    e.preventDefault()

    await fetch('http://localhost:5000/api/auth/register-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa, email, usuario, senha })
    })

    window.location.href = '/login'
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleRegister} className="card p-4" style={{ width: 400 }}>
        <h4 className="mb-3">Criar empresa</h4>

        <input className="form-control mb-2" placeholder="Nome da empresa" value={empresa} onChange={e => setEmpresa(e.target.value)} />
        <input className="form-control mb-2" placeholder="Email da empresa" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="form-control mb-2" placeholder="Usuário admin" value={usuario} onChange={e => setUsuario(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />

        <button className="btn btn-success">Criar conta</button>
      </form>
    </div>
  )
}
