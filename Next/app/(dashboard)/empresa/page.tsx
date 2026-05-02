"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fetchAddressByZipCode, formatDocument, formatPhone, formatZipCode, isValidDocument, isValidPhone, isValidZipCode, maskCpfCnpj, maskPhone, maskZipCode, normalizeDocument, normalizePhone, normalizeZipCode } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

export default function Empresa() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [checkingZipCode, setCheckingZipCode] = useState(false)
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
        document: formatDocument(data.document || ''),
        email: data.email || '',
        phone: formatPhone(data.phone || ''),
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: formatZipCode(data.zipCode || ''),
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

  async function resolveZipCode() {
    const zipCode = normalizeZipCode(company.zipCode)

    if (!zipCode) return

    if (!isValidZipCode(zipCode)) {
      setToast({ message: 'CEP invalido. Informe os 8 digitos.', type: 'error' })
      return
    }

    setCheckingZipCode(true)

    try {
      const address = await fetchAddressByZipCode(zipCode)

      if (!address) {
        setToast({ message: 'CEP nao encontrado.', type: 'error' })
        return
      }

      setCompany(prev => ({
        ...prev,
        zipCode: maskZipCode(zipCode),
        address: address.address || prev.address,
        city: address.city || prev.city,
        state: address.state || prev.state
      }))

      setToast({ message: 'Endereco preenchido pelo CEP.', type: 'success' })
    } catch {
      setToast({ message: 'Nao foi possivel consultar o CEP agora.', type: 'error' })
    } finally {
      setCheckingZipCode(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (company.document && !isValidDocument(company.document)) {
      setToast({ message: 'Documento invalido. Informe um CPF ou CNPJ valido.', type: 'error' })
      return
    }

    if (company.phone && !isValidPhone(company.phone)) {
      setToast({ message: 'Telefone invalido. Informe DDD e numero corretos.', type: 'error' })
      return
    }

    if (company.zipCode && !isValidZipCode(company.zipCode)) {
      setToast({ message: 'CEP invalido. Informe os 8 digitos.', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: company.name,
          tradeName: company.tradeName,
          document: normalizeDocument(company.document),
          email: company.email,
          phone: normalizePhone(company.phone),
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: normalizeZipCode(company.zipCode)
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

  const logoPreview = company.logoUrl || '/logo.png'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Perfil da Empresa</h2>
        <p className="text-muted-foreground">Mantenha os dados institucionais e de contato da empresa sempre atualizados.</p>
      </div>

      {loading ? <Loader label="Carregando perfil da empresa..." /> : (
        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle>Dados institucionais</CardTitle>
              <p className="text-sm text-muted-foreground">Informacoes principais usadas em documentos, relatorios e ordens de servico.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Razao social</label>
                    <Input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome fantasia</label>
                    <Input value={company.tradeName} onChange={e => setCompany({ ...company, tradeName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CNPJ/Documento</label>
                    <Input value={company.document} onChange={e => setCompany({ ...company, document: maskCpfCnpj(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email comercial</label>
                    <Input value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone comercial</label>
                    <Input value={company.phone} onChange={e => setCompany({ ...company, phone: maskPhone(e.target.value) })} />
                  </div>
                </div>

                <div className="h-px bg-app-border" />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Endereco</h3>
                  <p className="text-sm text-muted-foreground">Esses dados podem ser usados futuramente em recibos, contratos e impressoes.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-12">
                  <div className="space-y-2 md:col-span-8">
                    <label className="text-sm font-medium">Endereco</label>
                    <Input value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-4">
                    <label className="text-sm font-medium">CEP</label>
                    <Input
                      value={company.zipCode}
                      onChange={e => setCompany({ ...company, zipCode: maskZipCode(e.target.value) })}
                      onBlur={() => { void resolveZipCode() }}
                      disabled={checkingZipCode}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-6">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input value={company.city} onChange={e => setCompany({ ...company, city: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-6">
                    <label className="text-sm font-medium">Estado</label>
                    <Input value={company.state} onChange={e => setCompany({ ...company, state: e.target.value })} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar empresa</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Identidade visual</CardTitle>
                <p className="text-sm text-muted-foreground">A logo da empresa e usada no menu lateral, rodape e telas internas.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="company-logo-preview-wrap">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subdominio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">O subdominio identifica sua empresa no SaaS.</p>
                <code>{company.subdomain ? `${company.subdomain}.oserv.com` : 'empresa.oserv.com'}</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">Ativa</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
