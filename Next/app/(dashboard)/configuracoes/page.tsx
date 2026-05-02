"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPhone, isValidPhone, maskPhone, normalizePhone } from '@/lib/br'
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
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
        phone: formatPhone(data.phone || ''),
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

    if (company.phone && !isValidPhone(company.phone)) {
      setToast({ message: 'Telefone invalido. Informe DDD e numero corretos.', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...company,
          phone: normalizePhone(company.phone)
        })
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
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Configuracoes</h2>
        <p className="text-muted-foreground">Gerencie as preferencias gerais da sua empresa no oServ.</p>
      </div>

      {loading ? <Loader label="Carregando configuracoes..." /> : (
        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle>Dados da empresa</CardTitle>
              <p className="text-sm text-muted-foreground">Essas informacoes aparecem em relatorios, ordens de servico e comunicacoes internas.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da empresa</label>
                    <Input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email principal</label>
                    <Input value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input value={company.phone} onChange={e => setCompany({ ...company, phone: maskPhone(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subdominio</label>
                    <Input value={company.subdomain} disabled placeholder="empresa.oserv.com" />
                    <small className="block text-muted-foreground">O subdominio e definido no cadastro inicial da empresa.</small>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar alteracoes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Plano atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-semibold">{planLabel(company.plan)}</p>
                <small className="text-muted-foreground">A gestao de planos sera integrada quando o pagamento estiver pronto.</small>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seguranca</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Somente donos e funcionarios autorizados podem acessar o sistema pelo subdominio da empresa.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
