import { NextResponse } from 'next/server'
import { buildRootUrl, getCookieDomain, resolveRequestOrigin } from '@/lib/tenant'

export async function POST(req: Request) {
  const origin = resolveRequestOrigin(req)
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || getCookieDomain(new URL(origin).hostname)
  const redirectTo = buildRootUrl(origin, '/login')
  const response = NextResponse.json({ success: true, redirectTo })

  const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  }

  if (cookieDomain) {
    cookieOptions.domain = cookieDomain
  }

  response.cookies.set('auth_token', '', cookieOptions)

  return response
}
