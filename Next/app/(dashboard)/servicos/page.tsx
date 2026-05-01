"use client"

import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Servicos() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({ name: '', price: 0 })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/services')
    if (res.ok) setList(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ name: '', price: 0 })
    setModal(true)
  }

  function openEdit(service: any) {
    setForm(service)
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/services', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Erro ao salvar serviço')

      setToast({ message: 'Serviço salvo com sucesso', type: 'success' })
      setModal(false)
      setForm({ name: '', price: 0 })
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar serviço', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este serviço?')) return

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir serviço')
      setToast({ message: 'Serviço removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir serviço', type: 'error' })
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Serviços</h2>
          <p className="text-muted mb-0">Cadastro dos serviços usados nas ordens de serviço.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>Novo serviço</button>
      </div>

      {loading ? (
        <Loader label="Carregando serviços..." />
      ) : (
        <div className="card p-3">
          <table className="table table-hover mb-0">
            <thead><tr><th>Serviço</th><th>Preço</th><th className="text-end">Ações</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={3} className="text-center text-muted">Nenhum serviço cadastrado.</td></tr>}
              {list.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>R$ {Number(item.price).toFixed(2)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(item)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(item.id)}>Excluir</button>
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
            <h5>{form.id ? 'Editar serviço' : 'Novo serviço'}</h5>
            <form onSubmit={save} className="mt-3">
              <input className="form-control mb-2" placeholder="Nome do serviço" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="form-control mb-3" type="number" placeholder="Preço" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
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
