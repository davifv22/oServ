import Link from 'next/link'

const highlights = [
  {
    title: 'Ordens sem caos',
    description: 'Kanban por status, responsavel e prioridade para sua equipe ganhar ritmo sem perder contexto.'
  },
  {
    title: 'Clientes organizados',
    description: 'Centralize historico, contatos e servicos por empresa com isolamento completo por subdominio.'
  },
  {
    title: 'Time alinhado',
    description: 'Comentarios, mencoes e notificacoes internas para reduzir retrabalho e acelerar cada entrega.'
  }
]

export default function LandingPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="landing-root">
      <div className="landing-backdrop" />

      <header className="landing-header">
        <div className="landing-brand">
          <img className="landing-brand-logo" src="/logo.png" alt="Logo" />
          <span className="landing-brand-subtitle">Gestão ordem de serviços</span>
        </div>
        <Link href="/login" className="landing-login-link">Login</Link>
      </header>

      <section className="landing-hero">
        <span className="landing-badge">SaaS para operacao e servicos</span>
        <h1>Gestao de ordens de servico para empresas que querem escalar com controle.</h1>
        <p>
          Cadastre sua empresa, escolha um plano e entre no seu ambiente em subdominio proprio.
          Tudo pronto para comecar em minutos.
        </p>

        <div className="landing-actions">
          <Link href="/registro" className="landing-btn landing-btn-primary">Criar empresa</Link>
          <Link href="/planos" className="landing-btn landing-btn-secondary">Ver planos</Link>
        </div>
      </section>

      <section className="landing-grid" aria-label="Recursos principais">
        {highlights.map(item => (
          <article className="landing-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <img src="/logo-art.png" alt="oServ" />
          <div>
            <strong>oServ - Gestao ordem de servicos</strong>
            <span>oServ Corp</span>
          </div>
        </div>
        <small>(c) {currentYear} oServ Corp. Plataforma SaaS para gestao de ordens de servicos.</small>
      </footer>
    </main>
  )
}
