import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/registro', '/planos']
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret')

function getSubdomain(host: string) {
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  if (hostname.endsWith('localhost') && parts.length >= 2) {
    return parts[0] === 'localhost' ? null : parts[0]
  }

  return parts.length > 2 ? parts[0] : null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const tenant = getSubdomain(host)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const tokenSubdomain = payload.subdomain as string | undefined

    if (tenant && tokenSubdomain && tenant !== tokenSubdomain) {
      const url = request.nextUrl.clone()
      url.hostname = host.includes('localhost') ? `${tokenSubdomain}.localhost` : `${tokenSubdomain}.${host.split('.').slice(1).join('.')}`
      return NextResponse.redirect(url)
    }

    const response = NextResponse.next()
    response.headers.set('x-company-id', String(payload.companyId))
    response.headers.set('x-user-id', String(payload.userId))
    response.headers.set('x-user-role', String(payload.role))
    return response
  } catch {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
