"use client"

import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Funcionarios() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/employees')
    if (response.ok) setList(await response.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ hasAccess: false })
    setModal(true)
  }

  function openEdit(employee: any) {
    setForm(employee)
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/employees', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) throw new Error('Erro ao salvar funcionário')

      setToast({ message: 'Funcionário salvo com sucesso', type: 'success' })
      setModal(false)
      setForm({})
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar funcionário', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este funcionário?')) return

    try {
      const response = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir funcionário')
      setToast({ message: 'Funcionário removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir funcionário', type: 'error' })
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Funcionários</h2>
          <p className="text-muted mb-0">Gerencie funcionários e acesso ao sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>Novo funcionário</button>
      </div>

      {loading ? (
        <Loader label="Carregando funcionários..." />
      ) : (
        <div className="card p-3">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Cargo</th>
                <th>Acesso</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={6} className="text-muted text-center">Nenhum funcionário cadastrado.</td></tr>
              )}
              {list.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email || '-'}</td>
                  <td>{employee.phone || '-'}</td>
                  <td>{employee.position || '-'}</td>
                  <td>{employee.hasAccess ? <span className="badge bg-success">Sim</span> : <span className="badge bg-secondary">Não</span>}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(employee)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(employee.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop-custom">
          <div className="modal-card">
            <h5>{form.id ? 'Editar funcionário' : 'Novo funcionário'}</h5>
            <form onSubmit={save} className="mt-3">
              <input className="form-control mb-2" placeholder="Nome" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="form-control mb-2" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="form-control mb-2" placeholder="Telefone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="form-control mb-3" placeholder="Cargo" value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} />
              <label className="form-check mb-3">
                <input className="form-check-input" type="checkbox" checked={Boolean(form.hasAccess)} onChange={e => setForm({ ...form, hasAccess: e.target.checked })} />
                <span className="form-check-label ms-2">Permitir acesso ao sistema</span>
              </label>
              <div className="text-end">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-success">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
