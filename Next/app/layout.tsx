import type { Metadata } from 'next'
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
    <html lang="pt-BR" data-theme="dark" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
