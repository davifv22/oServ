"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { sanitizeSubdomain } from '@/lib/tenant'
import { fetchAddressByZipCode, isValidDocument, isValidPhone, isValidZipCode, maskCpfCnpj, maskPhone, maskZipCode, normalizeDocument, normalizePhone, normalizeZipCode } from '@/lib/br'
import Toast from '@/components/Toast'

type PlanId = 'STARTER' | 'PRO' | 'ENTERPRISE'

const plans: Array<{ id: PlanId; name: string; price: string; features: string[] }> = [
  { id: 'STARTER', name: 'Starter', price: 'R$ 49,90/mes', features: ['Ate 2 usuarios', 'Ate 100 clientes'] },
  { id: 'PRO', name: 'Pro', price: 'R$ 99,90/mes', features: ['Ate 10 usuarios', 'Ate 1000 clientes'] },
  { id: 'ENTERPRISE', name: 'Enterprise', price: 'R$ 199,90/mes', features: ['Usuarios ilimitados', 'Clientes ilimitados'] }
]

export default function Registro() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [checkingZipCode, setCheckingZipCode] = useState(false)
  const [subdomainFeedback, setSubdomainFeedback] = useState('')

  const [owner, setOwner] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [company, setCompany] = useState({
    name: '',
    tradeName: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    subdomain: ''
  })

  const [plan, setPlan] = useState<PlanId>('STARTER')
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const selectedPlan = searchParams.get('plan')?.toUpperCase()

    if (selectedPlan === 'STARTER' || selectedPlan === 'PRO' || selectedPlan === 'ENTERPRISE') {
      setPlan(selectedPlan)
    }
  }, [searchParams])

  const selectedPlan = useMemo(() => plans.find(item => item.id === plan), [plan])

  const onSubdomainChange = (value: string) => {
    const formatted = sanitizeSubdomain(value)
    setCompany(prev => ({ ...prev, subdomain: formatted }))
    setSubdomainFeedback('')
  }

  const checkSubdomainAvailability = async () => {
    const subdomain = sanitizeSubdomain(company.subdomain)

    if (!subdomain || subdomain.length < 3) {
      setSubdomainFeedback('Use um subdominio com pelo menos 3 caracteres.')
      setToast({ message: 'Use um subdominio com pelo menos 3 caracteres.', type: 'error' })
      return false
    }

    setCheckingSubdomain(true)

    try {
      const response = await fetch(`/api/subdomain/check?subdomain=${encodeURIComponent(subdomain)}`)
      const data = await response.json()

      if (!data.available) {
        setSubdomainFeedback('Este subdominio ja esta em uso.')
        setToast({ message: 'Este subdominio ja esta em uso.', type: 'error' })
        return false
      }

      setSubdomainFeedback('Subdominio disponivel!')
      setToast({ message: 'Subdominio disponivel!', type: 'success' })
      return true
    } catch {
      setSubdomainFeedback('Nao foi possivel validar o subdominio agora.')
      setToast({ message: 'Nao foi possivel validar o subdominio agora.', type: 'error' })
      return false
    } finally {
      setCheckingSubdomain(false)
    }
  }

  const resolveZipCode = async () => {
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

  const validateStepOne = () => {
    if (!owner.name || !owner.email || !owner.password || !owner.confirmPassword) {
      setError('Preencha todos os campos do dono da conta.')
      setToast({ message: 'Preencha todos os campos do dono da conta.', type: 'error' })
      return false
    }

    if (owner.password !== owner.confirmPassword) {
      setError('As senhas nao conferem.')
      setToast({ message: 'As senhas nao conferem.', type: 'error' })
      return false
    }

    if (owner.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      setToast({ message: 'A senha precisa ter pelo menos 6 caracteres.', type: 'error' })
      return false
    }

    return true
  }

  const validateStepTwo = async () => {
    if (!company.name || !company.subdomain) {
      setError('Nome da empresa e subdominio sao obrigatorios.')
      setToast({ message: 'Nome da empresa e subdominio sao obrigatorios.', type: 'error' })
      return false
    }

    if (company.document && !isValidDocument(company.document)) {
      setError('Documento invalido. Informe um CPF ou CNPJ valido.')
      setToast({ message: 'Documento invalido. Informe um CPF ou CNPJ valido.', type: 'error' })
      return false
    }

    if (company.phone && !isValidPhone(company.phone)) {
      setError('Telefone invalido. Informe DDD e numero corretos.')
      setToast({ message: 'Telefone invalido. Informe DDD e numero corretos.', type: 'error' })
      return false
    }

    if (company.zipCode && !isValidZipCode(company.zipCode)) {
      setError('CEP invalido. Informe os 8 digitos.')
      setToast({ message: 'CEP invalido. Informe os 8 digitos.', type: 'error' })
      return false
    }

    const available = await checkSubdomainAvailability()
    if (!available) {
      setError('Escolha um subdominio valido e disponivel para continuar.')
      setToast({ message: 'Escolha um subdominio valido e disponivel para continuar.', type: 'error' })
      return false
    }

    return true
  }

  const goNext = async () => {
    setError('')
    setToast(null)

    if (step === 1) {
      if (validateStepOne()) setStep(2)
      return
    }

    if (step === 2) {
      const valid = await validateStepTwo()
      if (valid) setStep(3)
    }
  }

  const goBack = () => {
    setError('')
    setToast(null)
    setStep(prev => Math.max(1, prev - 1))
  }

  const submitRegister = async () => {
    setError('')
    setToast(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: owner.name,
          ownerEmail: owner.email,
          ownerPassword: owner.password,
          companyName: company.name,
          tradeName: company.tradeName,
          document: normalizeDocument(company.document),
          companyEmail: company.email || owner.email,
          companyPhone: normalizePhone(company.phone),
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: normalizeZipCode(company.zipCode),
          subdomain: company.subdomain,
          plan,
          rememberMe
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar empresa')
      }

      setToast({ message: 'Empresa criada com sucesso. Redirecionando...', type: 'success' })
      window.location.href = data.redirectTo || '/dashboard'
    } catch (err: any) {
      const message = err.message || 'Erro ao criar empresa'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="auth-card w-full max-w-3xl border-app-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
            <img src="/logo.png" alt="oServ - Gestao ordem de servicos" className="h-auto w-[190px]" />
            <small className="text-muted-foreground">oServ - Gestao ordem de servicos</small>
          </div>

          <div>
            <CardTitle className="text-2xl">Criar empresa</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Etapa {step} de 3</p>
          </div>

          <div className="h-2 w-full rounded-full bg-app-surface-alt border border-app-border overflow-hidden">
            <div className="h-full bg-app-accent transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <h6 className="font-semibold">1. Dados do dono da conta</h6>
              <Input placeholder="Nome do dono" value={owner.name} onChange={e => setOwner({ ...owner, name: e.target.value })} required />
              <Input type="email" placeholder="Email do dono" value={owner.email} onChange={e => setOwner({ ...owner, email: e.target.value })} required />
              <Input type="password" placeholder="Senha" value={owner.password} onChange={e => setOwner({ ...owner, password: e.target.value })} required />
              <Input type="password" placeholder="Confirmar senha" value={owner.confirmPassword} onChange={e => setOwner({ ...owner, confirmPassword: e.target.value })} required />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h6 className="font-semibold">2. Informacoes da empresa</h6>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Razao social" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
                <Input placeholder="Nome fantasia" value={company.tradeName} onChange={e => setCompany({ ...company, tradeName: e.target.value })} />
                <Input placeholder="CNPJ/CPF" value={company.document} onChange={e => setCompany({ ...company, document: maskCpfCnpj(e.target.value) })} />
                <Input type="email" placeholder="Email da empresa" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
                <Input placeholder="Telefone" value={company.phone} onChange={e => setCompany({ ...company, phone: maskPhone(e.target.value) })} />
                <Input
                  placeholder="CEP"
                  value={company.zipCode}
                  onChange={e => setCompany({ ...company, zipCode: maskZipCode(e.target.value) })}
                  onBlur={() => { void resolveZipCode() }}
                  disabled={checkingZipCode}
                />
                <Input className="md:col-span-2" placeholder="Endereco" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
                <Input placeholder="Cidade" value={company.city} onChange={e => setCompany({ ...company, city: e.target.value })} />
                <Input placeholder="Estado" value={company.state} onChange={e => setCompany({ ...company, state: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subdominio</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="minhaempresa"
                    value={company.subdomain}
                    onChange={e => onSubdomainChange(e.target.value)}
                    onBlur={() => {
                      if (company.subdomain) {
                        void checkSubdomainAvailability()
                      }
                    }}
                    required
                  />
                  <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void checkSubdomainAvailability()} disabled={checkingSubdomain}>
                    {checkingSubdomain ? 'Validando...' : 'Verificar'}
                  </Button>
                </div>
                <small className="text-muted-foreground block">Exemplo: {company.subdomain || 'minhaempresa'}.localhost:3000</small>
                {subdomainFeedback && (
                  <small className={`block ${subdomainFeedback.includes('disponivel') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {subdomainFeedback}
                  </small>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h6 className="font-semibold">3. Escolha o plano</h6>

              <div className="grid gap-2 md:grid-cols-3">
                {plans.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    className={`rounded-xl border p-3 text-left transition-colors ${plan === item.id ? 'border-app-accent bg-app-surface-alt' : 'border-app-border bg-app-surface hover:border-app-accent/50'}`}
                    onClick={() => setPlan(item.id)}
                  >
                    <strong className="block">{item.name}</strong>
                    <div className="text-sm text-muted-foreground mb-2">{item.price}</div>
                    <ul className="space-y-1 pl-4 text-sm text-muted-foreground list-disc">
                      {item.features.map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                  </button>
                ))}
              </div>

              <Card className="border-app-border bg-app-surface-alt shadow-none">
                <CardContent className="p-3 text-sm">
                  <strong>Plano selecionado:</strong> {selectedPlan?.name}
                </CardContent>
              </Card>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                Manter conectado por 30 dias
              </label>
            </div>
          )}

          {error && <small className="block text-sm text-red-400">{error}</small>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="link" className="h-auto p-0 text-app-text hover:text-app-accent" asChild>
              <a href="/login">Ja tenho conta</a>
            </Button>

            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={goBack} disabled={loading || checkingSubdomain || checkingZipCode}>
                  Voltar
                </Button>
              )}

              {step < 3 && (
                <Button type="button" className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={() => void goNext()} disabled={loading || checkingSubdomain || checkingZipCode}>
                  Continuar
                </Button>
              )}

              {step === 3 && (
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitRegister} disabled={loading}>
                  {loading ? 'Criando empresa...' : 'Finalizar cadastro'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
