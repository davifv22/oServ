"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Empresa() {
  const [toast, setToast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [company, setCompany] = useState({
    name: '',
    tradeName: '',
    logoUrl: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    subdomain: ''
  })

  function emitCompanyUpdated(nextCompany: any) {
    window.dispatchEvent(new CustomEvent('oserv:company-updated', { detail: nextCompany }))
  }

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/company')
      if (!response.ok) throw new Error('Erro ao carregar empresa')
      const data = await response.json()
      const nextCompany = {
        name: data.name || '',
        tradeName: data.tradeName || '',
        logoUrl: data.logoUrl || '',
        document: data.document || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        subdomain: data.subdomain || ''
      }
      setCompany(nextCompany)
      emitCompanyUpdated(nextCompany)
    } catch {
      setToast({ message: 'Erro ao carregar perfil da empresa', type: 'error' })
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
        body: JSON.stringify({
          name: company.name,
          tradeName: company.tradeName,
          document: company.document,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: company.zipCode
        })
      })

      if (!response.ok) throw new Error('Erro ao salvar empresa')

      setToast({ message: 'Perfil da empresa atualizado com sucesso', type: 'success' })
      emitCompanyUpdated(company)
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar perfil da empresa', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar logo')

      setCompany(prev => {
        const nextCompany = { ...prev, logoUrl: data.logoUrl || '' }
        emitCompanyUpdated(nextCompany)
        return nextCompany
      })
      setToast({ message: 'Logo da empresa atualizada com sucesso', type: 'success' })
    } catch (error: any) {
      setToast({ message: error?.message || 'Erro ao enviar logo da empresa', type: 'error' })
    } finally {
      setUploadingLogo(false)
    }
  }

  async function removeLogo() {
    setUploadingLogo(true)

    try {
      const response = await fetch('/api/company/logo', { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao remover logo')

      setCompany(prev => {
        const nextCompany = { ...prev, logoUrl: data.logoUrl || '' }
        emitCompanyUpdated(nextCompany)
        return nextCompany
      })
      setToast({ message: 'Logo da empresa removida', type: 'info' })
    } catch (error: any) {
      setToast({ message: error?.message || 'Erro ao remover logo da empresa', type: 'error' })
    } finally {
      setUploadingLogo(false)
    }
  }

  const logoPreview = company.logoUrl || '/logo-art.png'

  return (
    <div>
      <div className="mb-4">
        <h2>Perfil da Empresa</h2>
        <p className="text-muted mb-0">Mantenha os dados institucionais e de contato da empresa sempre atualizados.</p>
      </div>

      {loading ? <Loader label="Carregando perfil da empresa..." /> : (
        <div className="row g-3">
          <div className="col-lg-8">
            <form onSubmit={save} className="card p-4 mb-3">
              <h5>Dados institucionais</h5>
              <p className="text-muted small">Informacoes principais usadas em documentos, relatorios e ordens de servico.</p>

              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label">Razao social</label>
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

              <h5>Endereco</h5>
              <p className="text-muted small">Esses dados podem ser usados futuramente em recibos, contratos e impressoes.</p>

              <div className="row g-3 mt-1">
                <div className="col-md-8">
                  <label className="form-label">Endereco</label>
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar empresa</Button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="card p-4 mb-3">
              <h5>Identidade visual</h5>
              <p className="text-muted small">A logo da empresa e usada no menu lateral, rodape e telas internas.</p>

              <div className="company-logo-preview-wrap mb-3">
                <img className="company-logo-preview" src={logoPreview} alt="Logo da empresa" />
              </div>

              <div className="flex gap-2 flex-wrap">
                <label className="inline-flex items-center px-3 py-2 text-sm font-medium text-app-text bg-transparent border border-app-border rounded-md cursor-pointer hover:bg-app-surface-alt transition-colors">
                  {uploadingLogo ? 'Enviando...' : 'Trocar logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={event => {
                      const file = event.target.files?.[0]
                      if (file) void uploadLogo(file)
                      event.currentTarget.value = ''
                    }}
                  />
                </label>

                <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void removeLogo()} disabled={uploadingLogo || !company.logoUrl}>
                  Remover
                </Button>
              </div>
            </div>

            <div className="card p-4 mb-3">
              <h5>Subdominio</h5>
              <p className="text-muted small mb-1">O subdominio identifica sua empresa no SaaS.</p>
              <code>{company.subdomain ? `${company.subdomain}.oserv.com` : 'empresa.oserv.com'}</code>
            </div>

            <div className="card p-4">
              <h5>Status da empresa</h5>
              <span className="badge bg-success align-self-start">Ativa</span>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
