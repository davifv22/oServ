import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signAuthHandoffToken, signAuthToken } from '@/lib/auth'
import { buildTenantUrl, getCookieDomain, resolveRequestOrigin } from '@/lib/tenant'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, rememberMe } = body as {
    email?: string
    password?: string
    rememberMe?: boolean
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha sao obrigatorios' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const shouldRemember = Boolean(rememberMe)

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { company: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return NextResponse.json({ error: 'Senha invalida' }, { status: 401 })
  }

  if (user.role === 'EMPLOYEE') {
    const employee = await prisma.employee.findFirst({
      where: {
        companyId: user.companyId,
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        hasAccess: true,
        userId: true
      }
    })

    if (!employee || !employee.hasAccess) {
      return NextResponse.json({ error: 'Acesso do funcionario desativado' }, { status: 403 })
    }

    if (!employee.userId) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: user.id }
      })
    }
  }

  const token = await signAuthToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role as any,
    subdomain: user.company.subdomain
  }, shouldRemember)

  const origin = resolveRequestOrigin(req)
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || getCookieDomain(new URL(origin).hostname)
  const useHandoff = !cookieDomain
  const handoffToken = useHandoff
    ? await signAuthHandoffToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role as any,
      subdomain: user.company.subdomain
    }, token)
    : null
  let redirectTo = buildTenantUrl(origin, user.company.subdomain, '/dashboard')

  if (useHandoff && handoffToken) {
    const handoffUrl = new URL(redirectTo)
    handoffUrl.searchParams.set('handoff', handoffToken)
    redirectTo = handoffUrl.toString()
  }

  const response = NextResponse.json({
    success: true,
    subdomain: user.company.subdomain,
    redirectTo
  })

  const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: shouldRemember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
  }

  if (!useHandoff) {
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain
    }

    response.cookies.set('auth_token', token, cookieOptions)
  }

  return response
}