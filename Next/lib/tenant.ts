const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'admin',
  'login',
  'registro',
  'planos',
  'dashboard',
  'localhost'
])

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/

export function sanitizeSubdomain(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function isValidSubdomain(value: string) {
  return SUBDOMAIN_REGEX.test(value) && !RESERVED_SUBDOMAINS.has(value)
}

export function getSubdomainFromHost(host: string) {
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  if (hostname.endsWith('localhost') && parts.length >= 2) {
    return parts[0] === 'localhost' ? null : parts[0]
  }

  return parts.length > 2 ? parts[0] : null
}

export function getTenantHostname(hostname: string, subdomain: string) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return `${subdomain}.localhost`
  }

  const parts = hostname.split('.')
  const base = parts.length > 2 ? parts.slice(1).join('.') : hostname
  return `${subdomain}.${base}`
}

export function getRootHostname(hostname: string) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return 'localhost'
  }

  const parts = hostname.split('.').filter(Boolean)
  if (parts.length <= 2) {
    return hostname
  }

  return parts.slice(1).join('.')
}

export function buildTenantUrl(origin: string, subdomain: string, pathname = '/dashboard') {
  const url = new URL(origin)
  url.hostname = getTenantHostname(url.hostname, subdomain)
  url.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function buildRootUrl(origin: string, pathname = '/login') {
  const url = new URL(origin)
  url.hostname = getRootHostname(url.hostname)
  url.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function resolveRequestOrigin(req: Request) {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const host = forwardedHost || req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto')

  if (host) {
    const scheme = proto || (host.includes('localhost') ? 'http' : 'https')
    return `${scheme}://${host}`
  }

  return new URL(req.url).origin
}

export function getCookieDomain(hostname: string) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return undefined
  }

  const parts = hostname.split('.').filter(Boolean)
  if (parts.length < 2) {
    return undefined
  }

  return parts.slice(-2).join('.')
}
