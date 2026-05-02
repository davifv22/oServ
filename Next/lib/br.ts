const ONLY_DIGITS_REGEX = /\D/g

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

const BRL_DECIMAL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function onlyDigits(value: string | null | undefined) {
  return (value || '').replace(ONLY_DIGITS_REGEX, '')
}

export function normalizeDocument(value: string | null | undefined) {
  return onlyDigits(value).slice(0, 14)
}

export function normalizePhone(value: string | null | undefined) {
  return onlyDigits(value).slice(0, 11)
}

export function normalizeZipCode(value: string | null | undefined) {
  return onlyDigits(value).slice(0, 8)
}

export function maskZipCode(value: string | null | undefined) {
  const digits = normalizeZipCode(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatZipCode(value: string | null | undefined) {
  return maskZipCode(value)
}

export function isValidZipCode(value: string | null | undefined) {
  return normalizeZipCode(value).length === 8
}

export type BrazilZipCodeAddress = {
  address: string
  city: string
  state: string
  neighborhood: string
  street: string
}

export async function fetchAddressByZipCode(value: string | null | undefined) {
  const zipCode = normalizeZipCode(value)
  if (zipCode.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Falha ao consultar CEP')
  }

  const data = await response.json() as {
    erro?: boolean
    logradouro?: string
    bairro?: string
    localidade?: string
    uf?: string
  }

  if (data.erro) return null

  const street = (data.logradouro || '').trim()
  const neighborhood = (data.bairro || '').trim()
  const address = [street, neighborhood].filter(Boolean).join(' - ')

  return {
    address,
    city: (data.localidade || '').trim(),
    state: (data.uf || '').trim(),
    neighborhood,
    street
  } satisfies BrazilZipCodeAddress
}

export function maskCpf(value: string | null | undefined) {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskCnpj(value: string | null | undefined) {
  const digits = onlyDigits(value).slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function maskCpfCnpj(value: string | null | undefined) {
  const digits = normalizeDocument(value)
  return digits.length <= 11 ? maskCpf(digits) : maskCnpj(digits)
}

export function formatDocument(value: string | null | undefined) {
  return maskCpfCnpj(value)
}

export function maskPhone(value: string | null | undefined) {
  const digits = normalizePhone(value)

  if (!digits) return ''

  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatPhone(value: string | null | undefined) {
  return maskPhone(value)
}

export function isValidPhone(value: string | null | undefined) {
  const digits = normalizePhone(value)
  if (digits.length !== 10 && digits.length !== 11) return false
  return !/^(\d)\1+$/.test(digits)
}

export function isValidCpf(value: string | null | undefined) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  sum = 0
  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === Number(cpf[10])
}

export function isValidCnpj(value: string | null | undefined) {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1+$/.test(cnpj)) return false

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let index = 0; index < firstWeights.length; index += 1) {
    sum += Number(cnpj[index]) * firstWeights[index]
  }

  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder
  if (firstDigit !== Number(cnpj[12])) return false

  sum = 0
  for (let index = 0; index < secondWeights.length; index += 1) {
    sum += Number(cnpj[index]) * secondWeights[index]
  }

  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder
  return secondDigit === Number(cnpj[13])
}

export function isValidDocument(value: string | null | undefined) {
  const digits = normalizeDocument(value)
  if (digits.length === 11) return isValidCpf(digits)
  if (digits.length === 14) return isValidCnpj(digits)
  return false
}

export function formatCurrencyBRL(value: number | string | null | undefined) {
  const parsed = Number(value || 0)
  return BRL_CURRENCY_FORMATTER.format(Number.isFinite(parsed) ? parsed : 0)
}

export function formatCurrencyInput(value: string | null | undefined) {
  const digits = onlyDigits(value)
  if (!digits) return ''
  const amount = Number(digits) / 100
  return BRL_DECIMAL_FORMATTER.format(Number.isFinite(amount) ? amount : 0)
}

export function numberToCurrencyInput(value: number | string | null | undefined) {
  const parsed = Number(value || 0)
  const safeNumber = Number.isFinite(parsed) ? parsed : 0
  return BRL_DECIMAL_FORMATTER.format(safeNumber)
}

export function parseCurrencyInput(value: string | null | undefined) {
  const digits = onlyDigits(value)
  if (!digits) return 0
  const amount = Number(digits) / 100
  return Number.isFinite(amount) ? amount : 0
}
