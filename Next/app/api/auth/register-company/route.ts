import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompanyPlan } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signAuthHandoffToken, signAuthToken } from '@/lib/auth'
import { buildTenantUrl, getCookieDomain, isValidSubdomain, resolveRequestOrigin, sanitizeSubdomain } from '@/lib/tenant'
const ALLOWED_PLANS: CompanyPlan[] = ['STARTER', 'PRO', 'ENTERPRISE']

type RegisterCompanyBody = {
  ownerName?: string
  ownerEmail?: string
  ownerPassword?: string
  companyName?: string
  tradeName?: string
  document?: string
  companyEmail?: string
  companyPhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  subdomain?: string
  plan?: string
  rememberMe?: boolean
}

export async function POST(req: Request) {
  const body = await req.json() as RegisterCompanyBody

  const ownerName = body.ownerName?.trim() || ''
  const ownerEmail = body.ownerEmail?.trim().toLowerCase() || ''
  const ownerPassword = body.ownerPassword || ''
  const companyName = body.companyName?.trim() || ''
  const companyEmail = body.companyEmail?.trim().toLowerCase() || ownerEmail
  const subdomain = sanitizeSubdomain(body.subdomain || '')
  const shouldRemember = Boolean(body.rememberMe)
  const parsedPlan = (body.plan || 'STARTER').toUpperCase() as CompanyPlan

  if (!ownerName || !ownerEmail || !ownerPassword || !companyName || !subdomain) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatorios' }, { status: 400 })
  }

  if (ownerPassword.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  if (!isValidSubdomain(subdomain)) {
    return NextResponse.json({ error: 'Subdominio invalido' }, { status: 400 })
  }

  if (!ALLOWED_PLANS.includes(parsedPlan)) {
    return NextResponse.json({ error: 'Plano invalido' }, { status: 400 })
  }

  const [existingSubdomain, existingOwner] = await Promise.all([
    prisma.company.findUnique({ where: { subdomain }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } })
  ])

  if (existingSubdomain) {
    return NextResponse.json({ error: 'Subdominio ja em uso' }, { status: 400 })
  }

  if (existingOwner) {
    return NextResponse.json({ error: 'Ja existe usuario com este email' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(ownerPassword, 10)

  const { company, owner } = await prisma.$transaction(async tx => {
    const createdCompany = await tx.company.create({
      data: {
        name: companyName,
        tradeName: body.tradeName?.trim() || null,
        document: body.document?.trim() || null,
        email: companyEmail,
        phone: body.companyPhone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zipCode: body.zipCode?.trim() || null,
        subdomain,
        plan: parsedPlan
      }
    })

    const createdOwner = await tx.user.create({
      data: {
        companyId: createdCompany.id,
        name: ownerName,
        email: ownerEmail,
        password: hashed,
        role: 'OWNER'
      }
    })

    return { company: createdCompany, owner: createdOwner }
  })

  const token = await signAuthToken({
    userId: owner.id,
    companyId: company.id,
    role: owner.role as 'OWNER' | 'ADMIN' | 'EMPLOYEE',
    subdomain: company.subdomain
  }, shouldRemember)

  const origin = resolveRequestOrigin(req)
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || getCookieDomain(new URL(origin).hostname)
  const useHandoff = !cookieDomain
  const handoffToken = useHandoff
    ? await signAuthHandoffToken({
      userId: owner.id,
      companyId: company.id,
      role: owner.role as 'OWNER' | 'ADMIN' | 'EMPLOYEE',
      subdomain: company.subdomain
    }, token)
    : null
  let redirectTo = buildTenantUrl(origin, company.subdomain, '/dashboard')

  if (useHandoff && handoffToken) {
    const handoffUrl = new URL(redirectTo)
    handoffUrl.searchParams.set('handoff', handoffToken)
    redirectTo = handoffUrl.toString()
  }

  const response = NextResponse.json({
    success: true,
    subdomain: company.subdomain,
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



