import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getCookieDomain, getRootHostname, getSubdomainFromHost, getTenantHostname, resolveRequestOrigin } from '@/lib/tenant'
import { verifyAuthHandoffToken } from '@/lib/auth'

const ROOT_PUBLIC_ROUTES = new Set(['/', '/login', '/registro', '/planos'])
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/subdomain']

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret')

type SubdomainCheckResponse = {
  available?: boolean
  exists?: boolean
  reason?: string
}

function isRootPublicRoute(pathname: string) {
  return ROOT_PUBLIC_ROUTES.has(pathname)
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some(route => pathname.startsWith(route))
}

function isApiRoute(pathname: string) {
  return pathname.startsWith('/api/')
}

function isPublicAsset(pathname: string) {
  return pathname === '/favicon.ico' || /\.[a-zA-Z0-9]+$/.test(pathname)
}

function redirectToRoot(request: NextRequest, pathname = '/') {
  const currentHost = request.headers.get('host') || request.nextUrl.host
  const currentHostname = currentHost.split(':')[0]
  const targetHostname = getRootHostname(currentHostname)
  return redirectResponse(request, buildRedirectUrl(request, targetHostname, pathname))
}

function redirectToTenant(request: NextRequest, subdomain: string, pathname: string) {
  const currentHost = request.headers.get('host') || request.nextUrl.host
  const currentHostname = currentHost.split(':')[0]
  const targetHostname = getTenantHostname(currentHostname, subdomain)
  return redirectResponse(request, buildRedirectUrl(request, targetHostname, pathname))
}

function redirectResponse(request: NextRequest, targetUrl: string) {
  const target = new URL(targetUrl)
  const currentHost = request.headers.get('host') || request.nextUrl.host
  const currentHostname = currentHost.split(':')[0]
  const crossHostLocalRedirect = currentHostname.endsWith('.localhost')
    && target.hostname !== currentHostname

  if (crossHostLocalRedirect) {
    const escapedTarget = JSON.stringify(target.toString())
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target.toString()}"></head><body><script>window.location.replace(${escapedTarget});</script></body></html>`,
      {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store'
        }
      }
    )
  }

  return NextResponse.redirect(target)
}

function buildRedirectUrl(request: NextRequest, hostname: string, pathname: string) {
  const origin = resolveRequestOrigin(request)
  const url = new URL(origin)
  url.hostname = hostname
  url.pathname = pathname
  url.search = ''
  return url.toString()
}

async function tenantExists(request: NextRequest, subdomain: string) {
  const origin = resolveRequestOrigin(request)
  const url = new URL('/api/subdomain/check', origin)
  url.searchParams.set('subdomain', subdomain)

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store'
  })

  if (!response.ok) {
    return false
  }

  const data = await response.json() as SubdomainCheckResponse

  if (typeof data.exists === 'boolean') {
    return data.exists
  }

  return data.available === false && data.reason !== 'invalid'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  const host = request.headers.get('host') || ''
  const tenant = getSubdomainFromHost(host)
  const handoffToken = request.nextUrl.searchParams.get('handoff')

  const rootPublicRoute = isRootPublicRoute(pathname)
  const publicApiRoute = isPublicApi(pathname)
  const subdomainCheckRoute = pathname.startsWith('/api/subdomain/check')

  if (tenant && !subdomainCheckRoute) {
    try {
      const validTenant = await tenantExists(request, tenant)

      if (!validTenant) {
        if (isApiRoute(pathname)) {
          return NextResponse.json({ error: 'Subdominio invalido' }, { status: 404 })
        }

        return redirectToRoot(request, '/')
      }
    } catch {
      if (isApiRoute(pathname)) {
        return NextResponse.json({ error: 'Nao foi possivel validar o subdominio' }, { status: 503 })
      }

      return redirectToRoot(request, '/')
    }
  }

  const token = request.cookies.get('auth_token')?.value
  let payload: Record<string, unknown> | null = null

  if (token) {
    try {
      const verified = await jwtVerify(token, secret)
      payload = verified.payload as Record<string, unknown>
    } catch {
      payload = null
    }
  }

  if (!payload && tenant && handoffToken) {
    try {
      const handoffPayload = await verifyAuthHandoffToken(handoffToken)
      const handoffSubdomain = handoffPayload.subdomain
      const sessionToken = handoffPayload.sessionToken

      if (handoffSubdomain !== tenant) {
        return redirectToTenant(request, handoffSubdomain, '/dashboard')
      }

      const verifiedSession = await jwtVerify(sessionToken, secret)
      const sessionSubdomain = verifiedSession.payload.subdomain as string | undefined

      if (!sessionSubdomain || sessionSubdomain !== tenant) {
        return redirectToRoot(request, '/login')
      }

      const cleanUrl = request.nextUrl.clone()
      cleanUrl.searchParams.delete('handoff')
      const currentHost = request.headers.get('host') || request.nextUrl.host
      const currentHostname = currentHost.split(':')[0]
      const sameHostUrl = new URL(resolveRequestOrigin(request))
      sameHostUrl.hostname = currentHostname
      sameHostUrl.pathname = cleanUrl.pathname
      sameHostUrl.search = cleanUrl.search
      const response = redirectResponse(request, sameHostUrl.toString())
      const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || getCookieDomain(currentHostname)
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expiryInSeconds = typeof verifiedSession.payload.exp === 'number'
        ? verifiedSession.payload.exp
        : nowInSeconds + 60 * 60 * 24
      const maxAge = Math.max(expiryInSeconds - nowInSeconds, 1)

      const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge
      }

      if (cookieDomain) {
        cookieOptions.domain = cookieDomain
      }

      response.cookies.set('auth_token', sessionToken, cookieOptions)
      return response
    } catch {
      return redirectToRoot(request, '/login')
    }
  }

  const tokenSubdomain = payload?.subdomain as string | undefined

  // Landing/login/registro/planos so existem no dominio raiz.
  if (tenant && rootPublicRoute) {
    if (tokenSubdomain) {
      if (tokenSubdomain !== tenant) {
        return redirectToTenant(request, tokenSubdomain, '/dashboard')
      }

      return redirectToTenant(request, tenant, '/dashboard')
    }

    return redirectToRoot(request, pathname === '/' ? '/' : '/login')
  }

  // Sessao valida sempre deve navegar no proprio subdominio.
  if (tokenSubdomain && (!tenant || tenant !== tokenSubdomain)) {
    const targetPath = rootPublicRoute ? '/dashboard' : pathname
    return redirectToTenant(request, tokenSubdomain, targetPath)
  }

  if (rootPublicRoute || publicApiRoute) {
    return NextResponse.next()
  }

  if (!payload) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    return tenant ? redirectToRoot(request, '/login') : redirectToRoot(request, '/login')
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-company-id', String(payload.companyId || ''))
  requestHeaders.set('x-user-id', String(payload.userId || ''))
  requestHeaders.set('x-user-role', String(payload.role || ''))

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
