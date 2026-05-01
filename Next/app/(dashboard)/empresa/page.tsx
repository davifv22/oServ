"use client"

import { useState } from 'react'
import Toast from '@/components/Toast'

export default function Empresa() {
  const [toast, setToast] = useState<any>(null)
  const [company, setCompany] = useState({
    name: '',
    tradeName: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  function save(e: React.FormEvent) {
    e.preventDefault()
    setToast({ message: 'Perfil da empresa atualizado com sucesso', type: 'success' })
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Perfil da Empresa</h2>
        <p className="text-muted mb-0">Mantenha os dados institucionais e de contato da empresa sempre atualizados.</p>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <form onSubmit={save} className="card p-4 mb-3">
            <h5>Dados institucionais</h5>
            <p className="text-muted small">Informações principais usadas em documentos, relatórios e ordens de serviço.</p>

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label">Razão social</label>
                <input className="form-control" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nome fantasia</label>
                <input className="form-control" value={company.tradeName} onChange={e => setCompany({ ...company, tradeName: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">CNPJ/Documento</label>
                <input className="form-control" value={company.document} onChange={e => setCompany({ ...company, document: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email comercial</label>
                <input className="form-control" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Telefone comercial</label>
                <input className="form-control" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
              </div>
            </div>

            <hr className="my-4" />

            <h5>Endereço</h5>
            <p className="text-muted small">Esses dados podem ser usados futuramente em recibos, contratos e impressões.</p>

            <div className="row g-3 mt-1">
              <div className="col-md-8">
                <label className="form-label">Endereço</label>
                <input className="form-control" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">CEP</label>
                <input className="form-control" value={company.zipCode} onChange={e => setCompany({ ...company, zipCode: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Cidade</label>
                <input className="form-control" value={company.city} onChange={e => setCompany({ ...company, city: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Estado</label>
                <input className="form-control" value={company.state} onChange={e => setCompany({ ...company, state: e.target.value })} />
              </div>
            </div>

            <div className="text-end mt-4">
              <button className="btn btn-success">Salvar empresa</button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card p-4 mb-3">
            <h5>Identidade visual</h5>
            <p className="text-muted small">Em breve você poderá cadastrar logo, cores e assinatura visual da empresa.</p>
            <button className="btn btn-outline-primary" disabled>Adicionar logo</button>
          </div>

          <div className="card p-4 mb-3">
            <h5>Subdomínio</h5>
            <p className="text-muted small mb-1">O subdomínio identifica sua empresa no SaaS.</p>
            <code>empresa.oserv.com</code>
          </div>

          <div className="card p-4">
            <h5>Status da empresa</h5>
            <span className="badge bg-success align-self-start">Ativa</span>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
