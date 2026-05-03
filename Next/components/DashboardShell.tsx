"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/NotificationBell'
import Toast from '@/components/Toast'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { href: '/clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
  { href: '/funcionarios', label: 'Funcionarios', icon: 'fa-solid fa-user-tie' },
  { href: '/servicos', label: 'Servicos', icon: 'fa-solid fa-screwdriver-wrench' },
  { href: '/tipos-os', label: 'Tipos de OS', icon: 'fa-solid fa-layer-group' },
  { href: '/materiais', label: 'Materiais', icon: 'fa-solid fa-boxes-stacked' },
  { href: '/veiculos', label: 'Veiculos', icon: 'fa-solid fa-car-side' },
  { href: '/ordens-servico', label: 'Ordens de Servico', icon: 'fa-solid fa-clipboard-list' },
  { href: '/financeiro', label: 'Financeiro', icon: 'fa-solid fa-coins' },
  { href: '/faturas-boletos', label: 'Faturas e Boletos', icon: 'fa-solid fa-file-invoice-dollar' },
  { href: '/configuracoes', label: 'Configuracoes', icon: 'fa-solid fa-gear' },
  { href: '/perfil', label: 'Perfil', icon: 'fa-solid fa-user' },
  { href: '/empresa', label: 'Perfil da Empresa', icon: 'fa-solid fa-building' }
]

const DESKTOP_BREAKPOINT = 992
const SIDEBAR_COLLAPSED_COOKIE = 'oserv_sidebar_collapsed'

function getCookieValue(name: string) {
  const cookie = `; ${document.cookie}`
  const parts = cookie.split(`; ${name}=`)
  if (parts.length !== 2) return null
  return decodeURIComponent(parts.pop()!.split(';').shift() || '')
}

function setCookieValue(name: string, value: string, maxAgeInDays = 365) {
  const maxAge = maxAgeInDays * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function DashboardShell({
  children,
  appVersion
}: {
  children: React.ReactNode
  appVersion?: string
}) {
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const appContentRef = useRef<HTMLDivElement | null>(null)

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
    document.documentElement.classList.toggle('dark', initial === 'dark')

    const savedSidebarCollapsed = getCookieValue(SIDEBAR_COLLAPSED_COOKIE)
    setSidebarCollapsed(savedSidebarCollapsed === '1')

    const syncViewport = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT
      setIsDesktop(desktop)

      if (desktop) {
        setSidebarOpen(false)
      }
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    const appContentEl = appContentRef.current
    const onAppContentScroll = () => {
      if (!appContentEl) return
      setShowBackToTop(appContentEl.scrollTop > 120)
    }

    if (appContentEl) {
      onAppContentScroll()
      appContentEl.addEventListener('scroll', onAppContentScroll, { passive: true })
    }

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
      if (appContentEl) {
        appContentEl.removeEventListener('scroll', onAppContentScroll)
      }
      window.removeEventListener('oserv:profile-updated', onProfileUpdated)
      window.removeEventListener('oserv:company-updated', onCompanyUpdated)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
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
      setSidebarOpen(prev => !prev)
      return
    }

    setSidebarCollapsed(prev => {
      const next = !prev
      setCookieValue(SIDEBAR_COLLAPSED_COOKIE, next ? '1' : '0')
      return next
    })
  }

  function scrollToTop() {
    const appContentEl = appContentRef.current
    if (appContentEl) {
      appContentEl.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const companyDisplayName = company?.tradeName || company?.name || 'Empresa'
  const appName = 'oServ - Sistema de Gestao de Ordem de Servico'
  const currentYear = hydrated ? new Date().getFullYear() : null
  const sidebarExpanded = isDesktop ? !sidebarCollapsed : sidebarOpen
  const appLogoUrl = '/logo.png'
  const companyLogoUrl = company?.logoUrl || '/logo.png'
  const systemVersion = (appVersion || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0').replace(/^v/i, '')

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${isDesktop && sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <Button variant="outline" size="sm" className="sidebar-close-btn bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={toggleSidebar}>
            <i className={`fa-solid ${sidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
            <span className="sidebar-close-label">Menu</span>
          </Button>
          <span className="sidebar-version-badge" title={`Versao ${systemVersion}`}>
            Versao v{systemVersion}
          </span>
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

      <div className="app-content" ref={appContentRef}>
        <header className="app-header">
          <div className="header-brand-wrap min-w-0">
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

            <div className="header-brand-block min-w-0">
              <img className="header-brand-logo" src={companyLogoUrl} alt="Logo da empresa" />
              <div className="min-w-0">
                <strong className="header-brand-company">{companyDisplayName}</strong>
                <small className="header-brand-app">{appName}</small>
              </div>
            </div>

          </div>

          <div className="header-actions">
            <div className="header-user-wrap">
              {user?.avatarUrl ? (
                <img className="header-user-avatar" src={user.avatarUrl} alt="Foto do usuario" />
              ) : (
                <span className="header-user-avatar-fallback">{getInitials(user?.name)}</span>
              )}

              <div className="min-w-0 header-user-text">
                <strong className="block truncate">{user?.name || 'Usuario'}</strong>
                <small className="text-muted-foreground block truncate">{user?.email}</small>
              </div>
            </div>

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
            <img src={appLogoUrl} alt="Logo do app" />
            <div>
              <strong>{appName}</strong>
              <small>{companyDisplayName}</small>
            </div>
          </div>
          <small suppressHydrationWarning>
            {currentYear ? `© Copyright ${currentYear} - Desenvolvido por oServ.` : '© Copyright - Desenvolvido por oServ.'}
          </small>
        </footer>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className={`back-to-top-btn ${showBackToTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <i className="fa-solid fa-arrow-up" />
        </Button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
