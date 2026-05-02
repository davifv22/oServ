"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { sanitizeSubdomain } from '@/lib/tenant'
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
          document: company.document,
          companyEmail: company.email || owner.email,
          companyPhone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: company.zipCode,
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
    <div className="auth-page d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="auth-card card p-4 shadow-sm" style={{ width: 620, maxWidth: '95vw' }}>
        <div className="text-center mb-3">
          <img src="/logo.png" alt="oServ - Gestão ordem de serviços" style={{ maxWidth: 190, height: 'auto' }} />
          <small className="text-muted d-block mt-2">oServ - Gestão ordem de serviços</small>
        </div>

        <h4 className="mb-1">Criar empresa</h4>
        <p className="text-muted small mb-3">Etapa {step} de 3</p>

        <div className="progress mb-4" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
          <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <>
            <h6 className="mb-3">1. Dados do dono da conta</h6>
            <input className="form-control mb-2" placeholder="Nome do dono" value={owner.name} onChange={e => setOwner({ ...owner, name: e.target.value })} required />
            <input className="form-control mb-2" type="email" placeholder="Email do dono" value={owner.email} onChange={e => setOwner({ ...owner, email: e.target.value })} required />
            <input className="form-control mb-2" type="password" placeholder="Senha" value={owner.password} onChange={e => setOwner({ ...owner, password: e.target.value })} required />
            <input className="form-control" type="password" placeholder="Confirmar senha" value={owner.confirmPassword} onChange={e => setOwner({ ...owner, confirmPassword: e.target.value })} required />
          </>
        )}

        {step === 2 && (
          <>
            <h6 className="mb-3">2. Informacoes da empresa</h6>
            <div className="row g-2">
              <div className="col-md-6">
                <input className="form-control" placeholder="Razao social" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Nome fantasia" value={company.tradeName} onChange={e => setCompany({ ...company, tradeName: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="CNPJ/CPF" value={company.document} onChange={e => setCompany({ ...company, document: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="email" placeholder="Email da empresa" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Telefone" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="CEP" value={company.zipCode} onChange={e => setCompany({ ...company, zipCode: e.target.value })} />
              </div>
              <div className="col-12">
                <input className="form-control" placeholder="Endereco" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Cidade" value={company.city} onChange={e => setCompany({ ...company, city: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Estado" value={company.state} onChange={e => setCompany({ ...company, state: e.target.value })} />
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label mb-1">Subdominio</label>
              <div className="input-group">
                <input
                  className="form-control"
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
              <small className="text-muted d-block mt-1">Exemplo: {company.subdomain || 'minhaempresa'}.localhost:3000</small>
              {subdomainFeedback && (
                <small className={`d-block mt-1 ${subdomainFeedback.includes('disponivel') ? 'text-success' : 'text-danger'}`}>
                  {subdomainFeedback}
                </small>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h6 className="mb-3">3. Escolha o plano</h6>
            <div className="row g-2">
              {plans.map(item => (
                <div className="col-md-4" key={item.id}>
                  <button
                    type="button"
                    className={`card w-100 p-3 text-start border ${plan === item.id ? 'border-primary' : 'border-light'}`}
                    onClick={() => setPlan(item.id)}
                  >
                    <strong>{item.name}</strong>
                    <div className="small text-muted mb-2">{item.price}</div>
                    <ul className="small mb-0" style={{ paddingLeft: 18 }}>
                      {item.features.map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                  </button>
                </div>
              ))}
            </div>

            <div className="alert alert-light border mt-3 mb-0">
              <strong>Plano selecionado:</strong> {selectedPlan?.name}
            </div>

            <label className="form-check mt-3 d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              <span className="form-check-label small">Manter conectado por 30 dias</span>
            </label>
          </>
        )}

        {error && <small className="text-danger d-block mt-3">{error}</small>}

        <div className="flex justify-between mt-4 gap-2">
          <Button variant="link" className="p-0 h-auto text-app-text hover:text-app-accent" asChild>
            <a href="/login">Já tenho conta</a>
          </Button>

          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={goBack} disabled={loading || checkingSubdomain}>
                Voltar
              </Button>
            )}

            {step < 3 && (
              <Button type="button" className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={() => void goNext()} disabled={loading || checkingSubdomain}>
                Continuar
              </Button>
            )}

            {step === 3 && (
              <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={submitRegister} disabled={loading}>
                {loading ? 'Criando empresa...' : 'Finalizar cadastro'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
