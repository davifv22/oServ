import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '')
}

function buildAbsoluteUploadBase() {
  return path.join(process.cwd(), 'public', 'uploads')
}

function resolveExtension(file: File) {
  const mimeExtension = MIME_EXTENSION_MAP[file.type]
  if (mimeExtension) return mimeExtension

  const nameParts = file.name.split('.')
  const candidate = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''
  if (candidate && /^[a-z0-9]+$/.test(candidate)) {
    return candidate
  }

  return null
}

export function validateImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo invalido. Envie uma imagem.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('A imagem deve ter no maximo 5MB.')
  }

  const extension = resolveExtension(file)
  if (!extension) {
    throw new Error('Formato de imagem nao suportado.')
  }

  return extension
}

export async function saveImageFile(params: {
  file: File
  ownerType: 'companies' | 'users'
  ownerId: string
  prefix: 'logo' | 'avatar'
}) {
  const extension = validateImageFile(params.file)
  const safeOwnerId = sanitizeSegment(params.ownerId)
  if (!safeOwnerId) {
    throw new Error('Identificador invalido para upload.')
  }

  const uploadBase = buildAbsoluteUploadBase()
  const targetDir = path.join(uploadBase, params.ownerType, safeOwnerId)
  await mkdir(targetDir, { recursive: true })

  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const fileName = `${params.prefix}-${timestamp}-${random}.${extension}`
  const absolutePath = path.join(targetDir, fileName)

  const arrayBuffer = await params.file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(arrayBuffer))

  const publicPath = `/uploads/${params.ownerType}/${safeOwnerId}/${fileName}`
  return publicPath
}

export async function removeImageByPublicPath(publicPath?: string | null) {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return

  const uploadBase = buildAbsoluteUploadBase()
  const relativePath = publicPath.replace('/uploads/', '')
  const absolutePath = path.join(uploadBase, relativePath)
  const normalizedBase = path.resolve(uploadBase)
  const normalizedTarget = path.resolve(absolutePath)

  if (!normalizedTarget.startsWith(normalizedBase)) return

  try {
    await rm(normalizedTarget, { force: true })
  } catch {
    // Ignora erro de remocao para nao interromper fluxo principal.
  }
}
