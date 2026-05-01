import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signAuthToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, rememberMe } = body

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 })
  }

  const token = await signAuthToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role as any,
    subdomain: user.company.subdomain
  }, rememberMe)

  const response = NextResponse.json({ success: true, subdomain: user.company.subdomain })

  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8
  })

  return response
}
