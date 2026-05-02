"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NotificationBell from '@/components/NotificationBell'
import Toast from '@/components/Toast'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { href: '/clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
  { href: '/funcionarios', label: 'Funcionarios', icon: 'fa-solid fa-user-tie' },
  { href: '/servicos', label: 'Servicos', icon: 'fa-solid fa-screwdriver-wrench' },
  { href: '/ordens-servico', label: 'Ordens de Servico', icon: 'fa-solid fa-clipboard-list' },
  { href: '/financeiro', label: 'Financeiro', icon: 'fa-solid fa-coins' },
  { href: '/configuracoes', label: 'Configuracoes', icon: 'fa-solid fa-gear' },
  { href: '/perfil', label: 'Perfil', icon: 'fa-solid fa-user' },
  { href: '/empresa', label: 'Perfil da Empresa', icon: 'fa-solid fa-building' }
]

const DESKTOP_BREAKPOINT = 992

function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    setHydrated(true)
    fetch('/api/profile').then(r => r.json()).then(setUser).catch(() => {
      setToast({ message: 'Nao foi possivel carregar seu perfil agora.', type: 'error' })
    })
    fetch('/api/company').then(r => r.json()).then(setCompany).catch(() => {
      setToast({ message: 'Nao foi possivel carregar os dados da empresa.', type: 'error' })
    })

    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)

    const syncViewport = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT
      setIsDesktop(desktop)

      if (desktop) {
        setSidebarOpen(false)
      }
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    const onProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (!customEvent.detail) return
      setUser((prev: any) => ({ ...(prev || {}), ...customEvent.detail }))
    }

    const onCompanyUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (!customEvent.detail) return
      setCompany((prev: any) => ({ ...(prev || {}), ...customEvent.detail }))
    }

    window.addEventListener('oserv:profile-updated', onProfileUpdated)
    window.addEventListener('oserv:company-updated', onCompanyUpdated)

    return () => {
      window.removeEventListener('resize', syncViewport)
      window.removeEventListener('oserv:profile-updated', onProfileUpdated)
      window.removeEventListener('oserv:company-updated', onCompanyUpdated)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      const data = await response.json()
      window.location.href = data.redirectTo || '/login'
    } catch {
      setToast({ message: 'Erro ao sair. Redirecionando para login...', type: 'error' })
      setTimeout(() => {
        window.location.href = '/login'
      }, 700)
    }
  }

  function toggleSidebar() {
    if (!isDesktop) {
      setSidebarCollapsed(false)
      setSidebarOpen(prev => !prev)
      return
    }

    setSidebarCollapsed(prev => !prev)
  }

  const companyDisplayName = company?.tradeName || company?.name || 'Empresa'
  const appName = 'oServ - Gestao ordem de servicos'
  const currentYear = hydrated ? new Date().getFullYear() : null
  const sidebarExpanded = isDesktop ? !sidebarCollapsed : sidebarOpen
  const companyLogoUrl = company?.logoUrl || '/logo-art.png'

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-content">
            <div className="sidebar-brand-main">
              <img className="sidebar-brand-logo" src={companyLogoUrl} alt="Logo da empresa" />
              <div className="sidebar-brand-titles">
                <h4 className="mb-0">{companyDisplayName}</h4>
                <small className="sidebar-app-name">{appName}</small>
              </div>
            </div>
            <small className="sidebar-subdomain">{company?.subdomain ? `${company.subdomain}.oserv.com` : 'Gestao de OS'}</small>
          </div>
          <Button variant="outline" size="sm" className="sidebar-close-btn bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={toggleSidebar}>
            <i className={`fa-solid ${sidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
          </Button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="sidebar-link"
              onClick={() => {
                if (!isDesktop) {
                  setSidebarOpen(false)
                }
              }}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-content">
        <header className="app-header">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              {user?.avatarUrl ? (
                <img className="header-user-avatar" src={user.avatarUrl} alt="Foto do usuario" />
              ) : (
                <span className="header-user-avatar-fallback">{getInitials(user?.name)}</span>
              )}

              <div className="min-w-0">
              <strong className="block truncate">{user?.name || 'Usuario'}</strong>
              <small className="text-muted-foreground block truncate">{user?.email}</small>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={toggleTheme}>
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </Button>
            <NotificationBell />
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              aria-label={loggingOut ? 'Saindo' : 'Sair'}
              title={loggingOut ? 'Saindo' : 'Sair'}
            >
              <i className={`fa-solid ${loggingOut ? 'fa-spinner fa-spin' : 'fa-right-from-bracket'}`} />
            </Button>
          </div>
        </header>

        <main className="app-page">{children}</main>

        <footer className="app-footer">
          <div className="app-footer-brand">
            <img src={companyLogoUrl} alt="Logo da empresa" />
            <div>
              <strong>{appName}</strong>
              <small>{companyDisplayName}</small>
            </div>
          </div>
          <small suppressHydrationWarning>
            {currentYear ? `(c) ${currentYear} oServ Corp. Todos os direitos reservados.` : '(c) oServ Corp. Todos os direitos reservados.'}
          </small>
        </footer>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
