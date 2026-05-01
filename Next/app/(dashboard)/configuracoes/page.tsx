"use client"

import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Configuracoes() {
  const [toast, setToast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    subdomain: ''
  })

  async function load() {
    setLoading(true)
    const response = await fetch('/api/company')
    if (response.ok) {
      const data = await response.json()
      setCompany({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        subdomain: data.subdomain || ''
      })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      })

      if (!response.ok) throw new Error('Erro ao salvar configurações')

      setToast({ message: 'Configurações salvas com sucesso', type: 'success' })
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar configurações', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Configurações</h2>
        <p className="text-muted mb-0">Gerencie as preferências gerais da sua empresa no oServ.</p>
      </div>

      {loading ? <Loader label="Carregando configurações..." /> : (
        <div className="row g-3">
          <div className="col-lg-8">
            <form onSubmit={save} className="card p-4">
              <h5>Dados da empresa</h5>
              <p className="text-muted small">Essas informações aparecem em relatórios, ordens de serviço e comunicações internas.</p>

              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label">Nome da empresa</label>
                  <input className="form-control" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email principal</label>
                  <input className="form-control" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input className="form-control" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Subdomínio</label>
                  <input className="form-control" value={company.subdomain} disabled placeholder="empresa.oserv.com" />
                  <small className="text-muted">O subdomínio é definido no cadastro inicial da empresa.</small>
                </div>
              </div>

              <div className="text-end mt-4">
                <button className="btn btn-success">Salvar alterações</button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="card p-4 mb-3">
              <h5>Plano atual</h5>
              <p className="text-muted mb-1">Starter</p>
              <small className="text-muted">A gestão de planos será integrada quando o pagamento estiver pronto.</small>
            </div>

            <div className="card p-4">
              <h5>Segurança</h5>
              <p className="text-muted small mb-0">Somente donos e funcionários autorizados podem acessar o sistema pelo subdomínio da empresa.</p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
