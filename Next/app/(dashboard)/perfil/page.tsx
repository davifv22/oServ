"use client"

import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Perfil() {
  const [toast, setToast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })

  async function load() {
    setLoading(true)
    const response = await fetch('/api/profile')
    if (response.ok) {
      const data = await response.json()
      setProfile({ name: data.name || '', email: data.email || '' })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Erro ao salvar perfil')

      setToast({ message: 'Perfil atualizado com sucesso', type: 'success' })
      await load()
    } catch {
      setToast({ message: 'Erro ao atualizar perfil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault()

    if (password.next !== password.confirm) {
      setToast({ message: 'As senhas não conferem', type: 'error' })
      return
    }

    setPassword({ current: '', next: '', confirm: '' })
    setToast({ message: 'Alteração de senha será conectada ao backend na próxima etapa', type: 'info' })
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Perfil</h2>
        <p className="text-muted mb-0">Gerencie seus dados pessoais e segurança da conta.</p>
      </div>

      {loading ? <Loader label="Carregando perfil..." /> : (
        <div className="row g-3">
          <div className="col-lg-8">
            <form onSubmit={saveProfile} className="card p-4 mb-3">
              <h5>Dados pessoais</h5>
              <p className="text-muted small">Essas informações são usadas dentro do sistema e nos registros de ações.</p>

              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
              </div>

              <div className="text-end mt-4">
                <button className="btn btn-success">Salvar perfil</button>
              </div>
            </form>

            <form onSubmit={changePassword} className="card p-4">
              <h5>Alterar senha</h5>
              <p className="text-muted small">Use uma senha forte para manter sua conta segura.</p>

              <input className="form-control mb-2" type="password" placeholder="Senha atual" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} />
              <input className="form-control mb-2" type="password" placeholder="Nova senha" value={password.next} onChange={e => setPassword({ ...password, next: e.target.value })} />
              <input className="form-control mb-3" type="password" placeholder="Confirmar nova senha" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />

              <div className="text-end">
                <button className="btn btn-primary">Alterar senha</button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="card p-4 mb-3">
              <h5>Segurança da sessão</h5>
              <p className="text-muted small mb-0">Sua sessão é protegida por cookie seguro e expiração automática.</p>
            </div>
            <div className="card p-4">
              <h5>Permissão</h5>
              <p className="text-muted small mb-0">Seu nível de acesso será exibido aqui conforme o perfil do usuário.</p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
