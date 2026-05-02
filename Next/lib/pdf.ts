import { formatDocument, formatPhone, formatZipCode } from '@/lib/br'

const PDF_COLORS = {
  primary: '#0891b2',
  primarySoft: '#e0f2fe',
  text: '#0f172a',
  muted: '#64748b',
  border: '#cbd5e1',
  surface: '#f8fafc',
  stripe: '#f1f5f9'
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return '-'
  const text = String(value).trim()
  return text.length > 0 ? text : '-'
}

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    OPEN: 'Aberta',
    IN_PROGRESS: 'Em andamento',
    WAITING_CUSTOMER: 'Aguardando cliente',
    FINISHED: 'Finalizada',
    CANCELED: 'Cancelada'
  }

  return map[status || ''] || normalizeText(status)
}

function priorityLabel(priority?: string) {
  const map: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente'
  }

  return map[priority || ''] || normalizeText(priority)
}

function localizeStatusTokens(text: string) {
  return text.replace(/\b(OPEN|IN_PROGRESS|WAITING_CUSTOMER|FINISHED|CANCELED)\b/g, code => statusLabel(code))
}

function timelineActionLabel(action?: string) {
  const map: Record<string, string> = {
    CREATED: 'Criacao',
    STATUS_CHANGED: 'Mudanca de status',
    UPDATED: 'Atualizacao',
    COMMENTED: 'Comentario',
    ASSIGNED: 'Atribuicao'
  }

  return map[action || ''] || normalizeText(action)
}

type PdfImageAsset = {
  kind: 'image' | 'svg'
  value: string
}

type PdfBranding = {
  companyName: string
  companyDocument: string | null
  companyEmail: string | null
  companyPhone: string | null
  companyAddress: string | null
  companyCity: string | null
  companyState: string | null
  companyZipCode: string | null
  companySubdomain: string | null
  companyLogo: PdfImageAsset | null
  appLogo: PdfImageAsset | null
}

function resolveAssetUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  if (typeof window === 'undefined') return pathOrUrl

  try {
    return new URL(pathOrUrl, window.location.origin).toString()
  } catch {
    return pathOrUrl
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    for (let offset = 0; offset < chunk.length; offset += 1) {
      binary += String.fromCharCode(chunk[offset])
    }
  }

  return btoa(binary)
}

async function loadPdfImageAsset(pathOrUrl?: string | null): Promise<PdfImageAsset | null> {
  const url = resolveAssetUrl(pathOrUrl)
  if (!url) return null

  try {
    const response = await fetch(url, { cache: 'force-cache' })
    if (!response.ok) return null

    const contentType = (response.headers.get('content-type') || '').toLowerCase()

    if (contentType.includes('svg')) {
      const svgMarkup = await response.text()
      return svgMarkup ? { kind: 'svg', value: svgMarkup } : null
    }

    const fileBuffer = await response.arrayBuffer()
    const base64 = arrayBufferToBase64(fileBuffer)
    const mime = contentType || 'image/png'
    return { kind: 'image', value: `data:${mime};base64,${base64}` }
  } catch {
    return null
  }
}

async function loadPdfBranding(): Promise<PdfBranding> {
  let companyName = 'Empresa'
  let companyDocument: string | null = null
  let companyEmail: string | null = null
  let companyPhone: string | null = null
  let companyAddress: string | null = null
  let companyCity: string | null = null
  let companyState: string | null = null
  let companyZipCode: string | null = null
  let companySubdomain: string | null = null
  let companyLogoUrl: string | null = null

  try {
    const companyResponse = await fetch('/api/company', { cache: 'no-store' })
    if (companyResponse.ok) {
      const company = await companyResponse.json()
      companyName = normalizeText(company?.tradeName || company?.name || 'Empresa')
      companyDocument = company?.document ? formatDocument(company.document) : null
      companyEmail = company?.email ? normalizeText(company.email) : null
      companyPhone = company?.phone ? formatPhone(company.phone) : null
      companyAddress = company?.address ? normalizeText(company.address) : null
      companyCity = company?.city ? normalizeText(company.city) : null
      companyState = company?.state ? normalizeText(company.state) : null
      companyZipCode = company?.zipCode ? formatZipCode(company.zipCode) : null
      companySubdomain = company?.subdomain ? normalizeText(company.subdomain) : null
      companyLogoUrl = company?.logoUrl || null
    }
  } catch {
    companyName = 'Empresa'
  }

  const companyLogo = await loadPdfImageAsset(companyLogoUrl)

  return {
    companyName,
    companyDocument,
    companyEmail,
    companyPhone,
    companyAddress,
    companyCity,
    companyState,
    companyZipCode,
    companySubdomain,
    companyLogo,
    appLogo: null
  }
}

async function getPdfMake() {
  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule
  const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule
  pdfMake.vfs = pdfFonts.vfs || pdfFonts
  return pdfMake
}

function buildHeaderBlock(title: string, subtitle: string | undefined, branding: PdfBranding) {
  const companyIdentityLines = [
    branding.companyDocument ? `CNPJ: ${branding.companyDocument}` : null,
    branding.companyEmail ? `Email: ${branding.companyEmail}` : null,
    branding.companyPhone ? `Telefone: ${branding.companyPhone}` : null
  ].filter(Boolean)

  const cityState = [branding.companyCity, branding.companyState].filter(Boolean).join(' - ')
  const companyAddressLine = [
    branding.companyAddress,
    cityState || null,
    branding.companyZipCode ? `CEP: ${branding.companyZipCode}` : null
  ].filter(Boolean).join(' | ')

  const logoNode = branding.companyLogo
    ? (branding.companyLogo.kind === 'svg'
      ? { svg: branding.companyLogo.value, width: 70, alignment: 'center' }
      : { image: branding.companyLogo.value, fit: [70, 70], alignment: 'center' })
    : { text: 'Sem logo', style: 'logoPlaceholder', alignment: 'center', margin: [0, 26, 0, 0] }

  return {
    stack: [
      {
        columns: [
          {
            width: 84,
            stack: [logoNode],
            margin: [0, 0, 10, 0]
          },
          {
            width: '*',
            columns: [
              {
                width: '*',
                stack: [
                  { text: branding.companyName, style: 'companyTitle' },
                  ...companyIdentityLines.map((line, index) => ({
                    text: line,
                    style: 'companyMeta',
                    margin: [0, index === 0 ? 4 : 2, 0, 0]
                  })),
                  companyAddressLine ? { text: companyAddressLine, style: 'companyMeta' } : undefined
                ].filter(Boolean)
              },
              {
                width: 'auto',
                stack: [
                  { text: title, style: 'docTitle', alignment: 'right' },
                  { text: subtitle || 'Documento oficial', style: 'docSubtitle', alignment: 'right' }
                ],
                margin: [8, 0, 0, 0]
              }
            ]
          }
        ],
        columnGap: 0
      },
      {
        margin: [0, 10, 0, 0],
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 1, lineColor: PDF_COLORS.border }]
      }
    ]
  }
}

function buildFooterBlock(currentPage: number, pageCount: number, branding: PdfBranding, documentLabel: string) {
  const leftBrand = { text: 'oServ - Sistema de Gestão de Ordem de Serviço', style: 'footerBrandText' }

  return {
    columns: [
      { width: 'auto', ...leftBrand, margin: [36, 0, 10, 0] },
      { width: '*', text: `${documentLabel} | Pagina ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right', margin: [0, 0, 36, 0] }
    ]
  }
}

function defaultStyles() {
  return {
    companyTitle: {
      bold: true,
      fontSize: 13,
      color: PDF_COLORS.text
    },
    companyMeta: {
      fontSize: 8,
      color: PDF_COLORS.muted
    },
    logoPlaceholder: {
      fontSize: 8,
      color: PDF_COLORS.muted
    },
    docTitle: {
      bold: true,
      fontSize: 14,
      color: PDF_COLORS.text
    },
    docSubtitle: {
      fontSize: 9,
      color: PDF_COLORS.muted,
      margin: [0, 2, 0, 0]
    },
    sectionTitle: {
      fontSize: 11,
      bold: true,
      color: PDF_COLORS.text,
      margin: [0, 0, 0, 8]
    },
    metricValue: {
      fontSize: 13,
      bold: true,
      color: PDF_COLORS.text
    },
    tableHeader: {
      bold: true,
      color: '#ffffff',
      fillColor: '#0f172a',
      margin: [0, 5, 0, 5],
      fontSize: 9
    },
    tableBody: {
      color: PDF_COLORS.text,
      margin: [0, 4, 0, 4],
      fontSize: 9
    },
    footer: {
      fontSize: 8,
      color: PDF_COLORS.muted,
      alignment: 'center'
    },
    footerBrandText: {
      fontSize: 8,
      color: PDF_COLORS.muted
    },
    label: {
      fontSize: 9,
      color: PDF_COLORS.muted
    },
    value: {
      fontSize: 10,
      color: PDF_COLORS.text,
      bold: true
    },
    paragraph: {
      fontSize: 10,
      color: PDF_COLORS.text,
      lineHeight: 1.3
    }
  }
}

function baseLayout() {
  return {
    hLineWidth: () => 0.8,
    vLineWidth: () => 0.8,
    hLineColor: () => PDF_COLORS.border,
    vLineColor: () => PDF_COLORS.border,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 5,
    paddingBottom: () => 5,
    fillColor: (rowIndex: number) => {
      if (rowIndex === 0) return '#0f172a'
      return rowIndex % 2 === 0 ? PDF_COLORS.stripe : '#ffffff'
    }
  }
}

function buildTableBody(headers: string[], keys: string[], rows: any[]) {
  const body = [headers.map(title => ({ text: normalizeText(title), style: 'tableHeader' }))]

  rows.forEach(row => {
    body.push(keys.map(key => ({ text: normalizeText(row?.[key]), style: 'tableBody' })))
  })

  return body
}

export async function exportListPdf(title: string, headers: string[], keys: string[], rows: any[], fileName: string) {
  const [pdfMake, branding] = await Promise.all([getPdfMake(), loadPdfBranding()])
  const generatedAt = formatDateTime(new Date())

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 34, 36, 40],
    content: [
      buildHeaderBlock(title, 'Relatorio premium', branding),
      {
        margin: [0, 14, 0, 12],
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Resumo', style: 'sectionTitle' },
              { text: `${rows.length} registros encontrados`, style: 'metricValue' },
              { text: `Gerado em ${generatedAt}`, style: 'label', margin: [0, 4, 0, 0] }
            ],
            fillColor: PDF_COLORS.surface,
            margin: [0, 0, 8, 0]
          },
          {
            width: 'auto',
            stack: [
              { text: 'Formato', style: 'label' },
              { text: 'PDF / A4', style: 'value', margin: [0, 4, 0, 0] }
            ],
            fillColor: PDF_COLORS.surface,
            margin: [8, 0, 0, 0]
          }
        ]
      },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: buildTableBody(headers, keys, rows)
        },
        layout: baseLayout()
      }
    ],
    footer(currentPage: number, pageCount: number) {
      return buildFooterBlock(currentPage, pageCount, branding, title)
    },
    styles: defaultStyles(),
    defaultStyle: {
      color: PDF_COLORS.text
    }
  }

  pdfMake.createPdf(docDefinition).download(fileName)
}

type ExportServiceOrderPdfOptions = {
  includeComments?: boolean
  includeTimeline?: boolean
  timeline?: any[]
}

export async function exportServiceOrderPdf(
  order: any,
  comments: any[],
  fileName: string,
  options: ExportServiceOrderPdfOptions = {}
) {
  const [pdfMake, branding] = await Promise.all([getPdfMake(), loadPdfBranding()])
  const includeComments = options.includeComments !== false
  const includeTimeline = options.includeTimeline !== false
  const timeline = Array.isArray(options.timeline) ? options.timeline : []

  const summaryRows = [
    { label: 'OS', value: normalizeText(order?.id) },
    { label: 'Titulo', value: normalizeText(order?.title) },
    { label: 'Status', value: statusLabel(order?.status) },
    { label: 'Prioridade', value: priorityLabel(order?.priority) },
    { label: 'Valor total', value: formatCurrency(order?.total) },
    { label: 'Criada em', value: formatDateTime(order?.createdAt) },
    { label: 'Atualizada em', value: formatDateTime(order?.updatedAt) }
  ]

  const customerRows = [
    { label: 'Cliente', value: normalizeText(order?.customer?.name) },
    { label: 'Email', value: normalizeText(order?.customer?.email) },
    { label: 'Telefone', value: normalizeText(order?.customer?.phone) }
  ]

  const employeeRows = [
    { label: 'Responsavel', value: normalizeText(order?.responsibleEmployee?.name) },
    { label: 'Email', value: normalizeText(order?.responsibleEmployee?.email) },
    { label: 'Telefone', value: normalizeText(order?.responsibleEmployee?.phone) }
  ]

  const commentsTableBody = [
    [
      { text: 'Autor', style: 'tableHeader' },
      { text: 'Comentario', style: 'tableHeader' },
      { text: 'Data', style: 'tableHeader' }
    ],
    ...comments.map(comment => [
      { text: normalizeText(comment?.author?.name || 'Sistema'), style: 'tableBody' },
      { text: localizeStatusTokens(normalizeText(comment?.message)), style: 'tableBody' },
      { text: formatDateTime(comment?.createdAt), style: 'tableBody' }
    ])
  ]

  const timelineTableBody = [
    [
      { text: 'Ator', style: 'tableHeader' },
      { text: 'Evento', style: 'tableHeader' },
      { text: 'Detalhes', style: 'tableHeader' },
      { text: 'Data', style: 'tableHeader' }
    ],
    ...timeline.map(item => [
      { text: normalizeText(item?.actor?.name || 'Sistema'), style: 'tableBody' },
      { text: timelineActionLabel(item?.action || item?.type), style: 'tableBody' },
      { text: localizeStatusTokens(normalizeText(item?.message)), style: 'tableBody' },
      { text: formatDateTime(item?.createdAt), style: 'tableBody' }
    ])
  ]

  const extraSections: any[] = []

  if (includeComments) {
    extraSections.push({ text: 'Comentarios', style: 'sectionTitle' })
    extraSections.push(
      comments.length === 0
        ? { text: 'Nenhum comentario registrado.', style: 'label', margin: [0, 0, 0, 14] }
        : {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: commentsTableBody
          },
          layout: baseLayout(),
          margin: [0, 0, 0, 14]
        }
    )
  }

  if (includeTimeline) {
    extraSections.push({ text: 'Pipeline e timeline', style: 'sectionTitle' })
    extraSections.push(
      timeline.length === 0
        ? { text: 'Nenhum evento de pipeline registrado.', style: 'label' }
        : {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto'],
            body: timelineTableBody
          },
          layout: baseLayout()
        }
    )
  }

  if (!includeComments && !includeTimeline) {
    extraSections.push({
      text: 'Sem secoes adicionais selecionadas para impressao.',
      style: 'label'
    })
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 34, 36, 40],
    content: [
      buildHeaderBlock('Ordem de Servico', `Documento da OS ${normalizeText(order?.id)}`, branding),
      {
        margin: [0, 14, 0, 12],
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Resumo executivo', style: 'sectionTitle' },
              {
                table: {
                  widths: ['auto', '*'],
                  body: summaryRows.map(item => [
                    { text: item.label, style: 'label' },
                    { text: item.value, style: 'value' }
                  ])
                },
                layout: 'noBorders'
              }
            ],
            fillColor: PDF_COLORS.surface,
            margin: [0, 0, 8, 0]
          },
          {
            width: '*',
            stack: [
              { text: 'Cliente', style: 'sectionTitle' },
              {
                table: {
                  widths: ['auto', '*'],
                  body: customerRows.map(item => [
                    { text: item.label, style: 'label' },
                    { text: item.value, style: 'value' }
                  ])
                },
                layout: 'noBorders'
              },
              { text: 'Responsavel', style: 'sectionTitle', margin: [0, 12, 0, 8] },
              {
                table: {
                  widths: ['auto', '*'],
                  body: employeeRows.map(item => [
                    { text: item.label, style: 'label' },
                    { text: item.value, style: 'value' }
                  ])
                },
                layout: 'noBorders'
              }
            ],
            fillColor: PDF_COLORS.surface,
            margin: [8, 0, 0, 0]
          }
        ]
      },
      { text: 'Descricao da OS', style: 'sectionTitle' },
      {
        text: normalizeText(order?.description || 'Sem descricao informada.'),
        style: 'paragraph',
        margin: [0, 0, 0, 14]
      },
      ...extraSections
    ],
    footer(currentPage: number, pageCount: number) {
      return buildFooterBlock(currentPage, pageCount, branding, `OS ${normalizeText(order?.id)}`)
    },
    styles: defaultStyles(),
    defaultStyle: {
      color: PDF_COLORS.text
    }
  }

  pdfMake.createPdf(docDefinition).download(fileName)
}
