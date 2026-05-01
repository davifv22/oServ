"use client"

import { useEffect, useState } from 'react'
import NotificationBell from '@/components/NotificationBell'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { href: '/clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
  { href: '/funcionarios', label: 'Funcionários', icon: 'fa-solid fa-user-tie' },
  { href: '/servicos', label: 'Serviços', icon: 'fa-solid fa-screwdriver-wrench' },
  { href: '/ordens-servico', label: 'Ordens de Serviço', icon: 'fa-solid fa-clipboard-list' },
  { href: '/financeiro', label: 'Financeiro', icon: 'fa-solid fa-coins' },
  { href: '/configuracoes', label: 'Configurações', icon: 'fa-solid fa-gear' },
  { href: '/perfil', label: 'Perfil', icon: 'fa-solid fa-user' },
  { href: '/empresa', label: 'Perfil da Empresa', icon: 'fa-solid fa-building' }
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(setUser).catch(() => {})
    fetch('/api/company').then(r => r.json()).then(setCompany).catch(() => {})

    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial = saved || 'light'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div>
            <h4 className="mb-0">{company?.tradeName || company?.name || 'oServ'}</h4>
            <small>{company?.subdomain ? `${company.subdomain}.oserv.com` : 'Gestão de OS'}</small>
          </div>
          <button className="btn btn-sm btn-outline-light d-lg-none" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <a key={item.href} href={item.href} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-content">
        <header className="app-header">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <button className="btn btn-outline-secondary d-lg-none" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <div className="min-w-0">
              <strong className="d-block text-truncate">{user?.name || 'Usuário'}</strong>
              <small className="text-muted d-block text-truncate">{user?.email}</small>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn btn-outline-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <NotificationBell />
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-outline-danger">Sair</button>
            </form>
          </div>
        </header>

        <main className="app-page">{children}</main>
      </div>
    </div>
  )
}
