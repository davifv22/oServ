import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="d-flex">
          <aside className="sidebar bg-dark text-white p-3">
            <h4>oServ</h4>
            <ul className="nav flex-column">
              <li><a href="/" className="nav-link text-white">Dashboard</a></li>
              <li><a href="/cadastro/clientes" className="nav-link text-white">Clientes</a></li>
              <li><a href="/cadastro/funcionarios" className="nav-link text-white">Funcionários</a></li>
              <li><a href="/gestao-oserv" className="nav-link text-white">Gestão</a></li>
              <li><a href="/financeiro-oserv" className="nav-link text-white">Financeiro</a></li>
            </ul>
          </aside>

          <main className="flex-grow-1">
            <header className="bg-white shadow p-3 d-flex justify-content-between">
              <span>Bem-vindo ao oServ</span>
              <button className="btn btn-danger" onClick={() => {
                sessionStorage.clear();
                window.location.href = '/login'
              }}>Sair</button>
            </header>

            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
