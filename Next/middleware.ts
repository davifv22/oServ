import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/registro', '/planos']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  const tenant = parts.length > 2 ? parts[0] : null
  const response = NextResponse.next()

  if (tenant && tenant !== 'www') {
    response.headers.set('x-tenant-subdomain', tenant)
  }

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (!isPublicRoute && !tenant && process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
