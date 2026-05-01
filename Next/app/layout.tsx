import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './globals.css'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="d-flex min-vh-100">
          <aside className="sidebar bg-dark text-white p-3" style={{ width: 260 }}>
            <h4 className="mb-4">oServ</h4>
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

          <main className="flex-grow-1 bg-light">
            <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
              <span>Bem-vindo ao oServ</span>
              <div className="d-flex align-items-center gap-2">
                <NotificationBell />
                <form action="/api/auth/logout" method="post">
                  <button className="btn btn-outline-danger">Sair</button>
                </form>
              </div>
            </header>

            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
