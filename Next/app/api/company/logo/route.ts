import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { removeImageByPublicPath, saveImageFile } from '@/lib/upload'

const prisma = new PrismaClient()

function getCompanyId(req: Request) {
  return req.headers.get('x-company-id')
}

const companySelect = {
  id: true,
  name: true,
  tradeName: true,
  logoUrl: true,
  document: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  subdomain: true,
  plan: true,
  createdAt: true
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo de imagem obrigatorio' }, { status: 400 })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logoUrl: true }
    })

    if (!company) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    const logoUrl = await saveImageFile({
      file,
      ownerType: 'companies',
      ownerId: companyId,
      prefix: 'logo'
    })

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
      select: companySelect
    })

    await removeImageByPublicPath(company.logoUrl)

    return NextResponse.json(updated)
  } catch (error: any) {
    const message = error?.message || 'Nao foi possivel enviar a logo.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const companyId = getCompanyId(req)
  if (!companyId) {
    return NextResponse.json({ error: 'Empresa nao identificada' }, { status: 401 })
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { logoUrl: true }
  })

  if (!company) {
    return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { logoUrl: null },
    select: companySelect
  })

  await removeImageByPublicPath(company.logoUrl)

  return NextResponse.json(updated)
}
