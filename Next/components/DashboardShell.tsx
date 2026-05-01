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
    <div className="d-flex min-vh-100 app-shell">
      <aside className="sidebar app-sidebar text-white p-3" style={{ width: 260 }}>
        <h4 className="mb-4">{company?.tradeName || company?.name || 'oServ'}</h4>
        <ul className="nav flex-column gap-1">
          {menuItems.map(item => (
            <li key={item.href}>
              <a href={item.href} className="nav-link text-white d-flex align-items-center gap-2">
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-grow-1 app-main">
        <header className="app-header shadow-sm p-3 d-flex justify-content-between align-items-center">
          <div>
            <strong>{user?.name || 'Usuário'}</strong>
            <small className="text-muted d-block">{user?.email}</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <NotificationBell />

            <form action="/api/auth/logout" method="post">
              <button className="btn btn-outline-danger">Sair</button>
            </form>
          </div>
        </header>

        <div className="p-4">{children}</div>
      </main>
    </div>
  )
}
