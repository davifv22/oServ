"use client"

import { useEffect, useState } from 'react'

export default function Servicos() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({ name: '', price: 0 })

  async function load() {
    const res = await fetch('/api/services')
    if (res.ok) setList(await res.json())
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/services', {
      method: form.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setModal(false)
    setForm({ name: '', price: 0 })
    load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Serviços</h2>
          <p className="text-muted mb-0">Cadastro dos serviços usados nas ordens de serviço.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>Novo serviço</button>
      </div>

      <div className="card p-3">
        <table className="table table-hover mb-0">
          <thead><tr><th>Serviço</th><th>Preço</th><th className="text-end">Ações</th></tr></thead>
          <tbody>
            {list.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>R$ {Number(item.price).toFixed(2)}</td>
                <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => { setForm(item); setModal(true) }}>Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  )
}
