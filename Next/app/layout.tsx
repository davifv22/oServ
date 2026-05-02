import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'oServ - Gestão ordem de serviços',
  description: 'Sistema para gestão de ordens de serviços',
  icons: {
    icon: '/logo-art.png',
    shortcut: '/logo-art.png',
    apple: '/logo-art.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
