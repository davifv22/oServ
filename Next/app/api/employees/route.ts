import { NextResponse } from 'next/server'
import { Prisma, PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type EmployeeInput = {
  name: string
  email: string | null
  phone: string | null
  position: string | null
  hasAccess: boolean
  accessPassword: string
}

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeOptionalString(value: unknown) {
  const normalized = normalizeString(value)
  return normalized || null
}

function normalizeEmail(value: unknown) {
  const normalized = normalizeString(value).toLowerCase()
  return normalized || null
}

function parseEmployeeInput(body: Record<string, unknown>): EmployeeInput {
  return {
    name: normalizeString(body.name),
    email: normalizeEmail(body.email),
    phone: normalizeOptionalString(body.phone),
    position: normalizeOptionalString(body.position),
    hasAccess: Boolean(body.hasAccess),
    accessPassword: normalizeString(body.accessPassword || body.password)
  }
}

async function syncEmployeeUser(
  tx: Prisma.TransactionClient,
  params: {
    companyId: string
    name: string
    email: string | null
    accessPassword: string
    userId: string | null
  }
) {
  const { companyId, name, email, accessPassword } = params
  let { userId } = params
  const shouldSetPassword = Boolean(accessPassword)

  if (!email) {
    throw new HttpError('Informe um email para liberar acesso ao sistema', 400)
  }

  if (!userId && !shouldSetPassword) {
    throw new HttpError('Defina uma senha para o login do funcionario', 400)
  }

  if (shouldSetPassword && accessPassword.length < 6) {
    throw new HttpError('A senha deve ter pelo menos 6 caracteres', 400)
  }

  let targetUser = userId
    ? await tx.user.findFirst({ where: { id: userId, companyId } })
    : null

  const userWithEmail = await tx.user.findUnique({ where: { email } })

  if (userWithEmail) {
    if (userWithEmail.companyId !== companyId) {
      throw new HttpError('Ja existe usuario com este email', 409)
    }

    if (userWithEmail.role === Role.OWNER) {
      throw new HttpError('Este email ja pertence ao dono da empresa', 409)
    }

    if (targetUser && userWithEmail.id !== targetUser.id) {
      throw new HttpError('Este email ja pertence a outro usuario da empresa', 409)
    }

    targetUser = userWithEmail
  }

  if (!targetUser) {
    const passwordHash = await bcrypt.hash(accessPassword, 10)
    const createdUser = await tx.user.create({
      data: {
        companyId,
        name,
        email,
        password: passwordHash,
        role: Role.EMPLOYEE
      }
    })

    return createdUser.id
  }

  const userData: Prisma.UserUpdateInput = {
    name,
    email,
    role: Role.EMPLOYEE
  }

  if (shouldSetPassword) {
    userData.password = await bcrypt.hash(accessPassword, 10)
  }

  await tx.user.update({
    where: { id: targetUser.id },
    data: userData
  })

  return targetUser.id
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(employees)
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  try {
    const body = await req.json() as Record<string, unknown>
    const input = parseEmployeeInput(body)

    if (!input.name) {
      return NextResponse.json({ error: 'Nome do funcionario e obrigatorio' }, { status: 400 })
    }

    const employee = await prisma.$transaction(async tx => {
      const userId = input.hasAccess
        ? await syncEmployeeUser(tx, {
          companyId,
          name: input.name,
          email: input.email,
          accessPassword: input.accessPassword,
          userId: null
        })
        : null

      return tx.employee.create({
        data: {
          companyId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          position: input.position,
          hasAccess: input.hasAccess,
          userId
        }
      })
    })

    return NextResponse.json(employee)
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ja existe usuario com este email' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Erro ao salvar funcionario' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  try {
    const body = await req.json() as Record<string, unknown>
    const employeeId = normalizeString(body.id)

    if (!employeeId) {
      return NextResponse.json({ error: 'ID do funcionario e obrigatorio' }, { status: 400 })
    }

    const input = parseEmployeeInput(body)

    if (!input.name) {
      return NextResponse.json({ error: 'Nome do funcionario e obrigatorio' }, { status: 400 })
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Funcionario nao encontrado' }, { status: 404 })
    }

    const employee = await prisma.$transaction(async tx => {
      const userId = input.hasAccess
        ? await syncEmployeeUser(tx, {
          companyId,
          name: input.name,
          email: input.email,
          accessPassword: input.accessPassword,
          userId: existingEmployee.userId
        })
        : existingEmployee.userId

      return tx.employee.update({
        where: { id: existingEmployee.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          position: input.position,
          hasAccess: input.hasAccess,
          userId
        }
      })
    })

    return NextResponse.json(employee)
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ja existe usuario com este email' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Erro ao salvar funcionario' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await prisma.employee.deleteMany({ where: { id, companyId } })

  return NextResponse.json({ success: true })
}