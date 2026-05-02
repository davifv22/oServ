"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

type CompanyState = {
  name: string
  email: string
  phone: string
  subdomain: string
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE'
}

function planLabel(plan: CompanyState['plan']) {
  if (plan === 'PRO') return 'Pro'
  if (plan === 'ENTERPRISE') return 'Enterprise'
  return 'Starter'
}

export default function Configuracoes() {
  const [toast, setToast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<CompanyState>({
    name: '',
    email: '',
    phone: '',
    subdomain: '',
    plan: 'STARTER'
  })

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/company')
      if (!response.ok) throw new Error('Erro ao carregar configuracoes')
      const data = await response.json()
      setCompany({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        subdomain: data.subdomain || '',
        plan: data.plan || 'STARTER'
      })
    } catch {
      setToast({ message: 'Erro ao carregar configuracoes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      })

      if (!response.ok) throw new Error('Erro ao salvar configuracoes')

      setToast({ message: 'Configuracoes salvas com sucesso', type: 'success' })
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar configuracoes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Configuracoes</h2>
        <p className="text-muted mb-0">Gerencie as preferencias gerais da sua empresa no oServ.</p>
      </div>

      {loading ? <Loader label="Carregando configuracoes..." /> : (
        <div className="row g-3">
          <div className="col-lg-8">
            <form onSubmit={save} className="card p-4">
              <h5>Dados da empresa</h5>
              <p className="text-muted small">Essas informacoes aparecem em relatorios, ordens de servico e comunicacoes internas.</p>

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
                  <label className="form-label">Subdominio</label>
                  <input className="form-control" value={company.subdomain} disabled placeholder="empresa.oserv.com" />
                  <small className="text-muted">O subdominio e definido no cadastro inicial da empresa.</small>
                </div>
              </div>

              <div className="text-end mt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar alterações</Button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="card p-4 mb-3">
              <h5>Plano atual</h5>
              <p className="text-muted mb-1">{planLabel(company.plan)}</p>
              <small className="text-muted">A gestao de planos sera integrada quando o pagamento estiver pronto.</small>
            </div>

            <div className="card p-4">
              <h5>Seguranca</h5>
              <p className="text-muted small mb-0">Somente donos e funcionarios autorizados podem acessar o sistema pelo subdominio da empresa.</p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
