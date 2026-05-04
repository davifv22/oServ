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

function invoiceStatusLabel(status?: string) {
  const map: Record<string, string> = {
    DRAFT: 'Rascunho',
    ISSUED: 'Emitida',
    PAID: 'Paga',
    OVERDUE: 'Vencida',
    CANCELED: 'Cancelada'
  }

  return map[status || ''] || normalizeText(status)
}

function boletoStatusLabel(status?: string) {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    EXPIRED: 'Expirado',
    CANCELED: 'Cancelado'
  }

  return map[status || ''] || normalizeText(status)
}

function itemTypeLabel(value?: string) {
  return value === 'MATERIAL' ? 'Material' : 'Servico'
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

function formatBoletoCode(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 0 ? '-' : digits.match(/.{1,5}/g)?.join(' ') ?? digits
}

function buildBoletoBarcodeGraphic(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return []

  const width = 520
  const height = 44
  const segmentWidth = Math.max(2, Math.floor(width / digits.length))

  return digits.split('').map((digit, index) => {
    const even = Number(digit) % 2 === 0
    return {
      type: 'rect' as const,
      x: index * segmentWidth,
      y: 0,
      w: segmentWidth,
      h: height,
      color: even ? PDF_COLORS.text : '#ffffff'
    }
  })
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
    },
    barcodeText: {
      fontSize: 10,
      color: PDF_COLORS.text,
      bold: true,
      alignment: 'center'
    },
    importantNote: {
      fontSize: 9,
      color: PDF_COLORS.text,
      italics: true,
      margin: [0, 4, 0, 0]
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

async function buildInvoiceDocument(invoice: any, branding: PdfBranding) {
  const invoiceRows = Array.isArray(invoice?.serviceOrder?.invoices) ? invoice.serviceOrder.invoices : []
  const boleto = invoice?.boleto

  const documentTitle = 'Fatura'
  const documentSubtitle = invoice?.code ? `Fatura ${normalizeText(invoice.code)}` : `Fatura ${normalizeText(invoice.id)}`

  const invoiceSummaryRows = [
    { label: 'Fatura', value: normalizeText(invoice.code || invoice.id) },
    { label: 'Status', value: invoiceStatusLabel(invoice?.status) },
    { label: 'Emissao', value: formatDateTime(invoice?.issueDate) },
    { label: 'Vencimento', value: formatDateTime(invoice?.dueDate) },
    { label: 'Subtotal', value: formatCurrency(invoice?.subtotal) },
    { label: 'Desconto', value: formatCurrency(invoice?.discount) },
    { label: 'Juros', value: formatCurrency(invoice?.interest) },
    { label: 'Total', value: formatCurrency(invoice?.total) }
  ]

  const orderSummaryRows = [
    { label: 'OS', value: normalizeText(invoice?.serviceOrder?.title || invoice?.serviceOrder?.id) },
    { label: 'Cliente', value: normalizeText(invoice?.serviceOrder?.customer?.name) },
    { label: 'Responsavel', value: normalizeText(invoice?.serviceOrder?.responsibleEmployee?.name) },
    { label: 'Status da OS', value: statusLabel(invoice?.serviceOrder?.status) }
  ]

  const boletoRows = boleto ? [
    { label: 'Status do boleto', value: boletoStatusLabel(boleto?.status) },
    { label: 'Banco', value: normalizeText(boleto?.bankName) },
    { label: 'Vencimento do boleto', value: formatDateTime(boleto?.dueDate) },
    { label: 'Codigo de barras', value: normalizeText(boleto?.barcode) },
    { label: 'Linha digitavel', value: normalizeText(boleto?.digitableLine) }
  ] : []

  const demonstrativeRows = [
    { label: 'Valor bruto', value: formatCurrency(invoice?.subtotal) },
    { label: 'Descontos aplicados', value: formatCurrency(invoice?.discount) },
    { label: 'Juros e acrescimos', value: formatCurrency(invoice?.interest) },
    { label: 'Total a pagar', value: formatCurrency(invoice?.total) }
  ]

  const content: any[] = [
    buildHeaderBlock(documentTitle, documentSubtitle, branding),
    {
      margin: [0, 14, 0, 12],
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Resumo da fatura', style: 'sectionTitle' },
            {
              table: {
                widths: ['auto', '*'],
                body: invoiceSummaryRows.map(item => [
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
            { text: 'Resumo da OS', style: 'sectionTitle' },
            {
              table: {
                widths: ['auto', '*'],
                body: orderSummaryRows.map(item => [
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
    { text: 'Demonstrativos de cobranca', style: 'sectionTitle' },
    {
      table: {
        widths: ['auto', '*'],
        body: demonstrativeRows.map(item => [
          { text: item.label, style: 'label' },
          { text: item.value, style: 'value' }
        ])
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 14]
    },
    { text: 'Observacoes', style: 'sectionTitle' },
    { text: normalizeText(invoice?.notes), style: 'paragraph', margin: [0, 0, 0, 14] }
  ]

  if (boletoRows.length > 0) {
    content.push({ text: 'Dados do boleto', style: 'sectionTitle' })
    content.push({
      table: {
        widths: ['auto', '*'],
        body: boletoRows.map(item => [
          { text: item.label, style: 'label' },
          { text: item.value, style: 'value' }
        ])
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 14]
    })
  }

  if (invoiceRows.length > 0) {
    content.push({ text: 'Outras faturas da OS', style: 'sectionTitle' })
    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'Fatura', style: 'tableHeader' },
            { text: 'Status', style: 'tableHeader' },
            { text: 'Vencimento', style: 'tableHeader' },
            { text: 'Total', style: 'tableHeader' },
            { text: 'Boleto', style: 'tableHeader' }
          ],
          ...invoiceRows.map((item: any) => [
            { text: normalizeText(item?.code || item?.id), style: 'tableBody' },
            { text: invoiceStatusLabel(item?.status), style: 'tableBody' },
            { text: formatDateTime(item?.dueDate || item?.createdAt), style: 'tableBody' },
            { text: formatCurrency(item?.total), style: 'tableBody' },
            { text: item?.boleto ? boletoStatusLabel(item.boleto.status) : 'Sem boleto', style: 'tableBody' }
          ])
        ]
      },
      layout: baseLayout(),
      margin: [0, 0, 0, 14]
    })
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 34, 36, 40],
    content,
    footer(currentPage: number, pageCount: number) {
      return buildFooterBlock(currentPage, pageCount, branding, documentTitle)
    },
    styles: defaultStyles(),
    defaultStyle: { color: PDF_COLORS.text }
  }

  return docDefinition
}

async function buildBoletoDocument(invoice: any, branding: PdfBranding) {
  const boleto = invoice?.boleto
  const documentTitle = 'Boleto Bancário'
  const documentSubtitle = invoice?.code ? `Boleto da fatura ${normalizeText(invoice.code)}` : `Boleto da fatura ${normalizeText(invoice.id)}`

  const boletoRows = [
    { label: 'Status', value: boletoStatusLabel(boleto?.status) },
    { label: 'Banco', value: normalizeText(boleto?.bankName) },
    { label: 'Vencimento', value: formatDateTime(boleto?.dueDate) },
    { label: 'Codigo de barras', value: normalizeText(boleto?.barcode) },
    { label: 'Linha digitavel', value: normalizeText(boleto?.digitableLine) },
    { label: 'Valor da fatura', value: formatCurrency(invoice?.total) }
  ]

  const orderRows = [
    { label: 'OS', value: normalizeText(invoice?.serviceOrder?.title || invoice?.serviceOrder?.id) },
    { label: 'Cliente', value: normalizeText(invoice?.serviceOrder?.customer?.name) },
    { label: 'Responsavel', value: normalizeText(invoice?.serviceOrder?.responsibleEmployee?.name) }
  ]

  const content = [
    buildHeaderBlock(documentTitle, documentSubtitle, branding),
    {
      margin: [0, 14, 0, 12],
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Resumo do boleto', style: 'sectionTitle' },
            {
              table: {
                widths: ['auto', '*'],
                body: boletoRows.map(item => [
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
            { text: 'Resumo da OS', style: 'sectionTitle' },
            {
              table: {
                widths: ['auto', '*'],
                body: orderRows.map(item => [
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
    { text: 'Informacoes adicionais', style: 'sectionTitle' },
    { text: normalizeText(invoice?.notes), style: 'paragraph', margin: [0, 0, 0, 14] }
  ]

  if (boleto?.barcode || boleto?.digitableLine) {
    const formattedBarcode = formatBoletoCode(boleto?.barcode)
    content.push({ text: 'Linha digitavel', style: 'sectionTitle' })
    content.push({ text: formatBoletoCode(boleto?.digitableLine), style: 'barcodeText', margin: [0, 0, 0, 8] })

    content.push({ text: 'Codigo de barras', style: 'sectionTitle' })
    const barcodeGraphic: any = {
      canvas: buildBoletoBarcodeGraphic(boleto?.barcode),
      margin: [0, 0, 0, 8]
    }
    content.push(barcodeGraphic)
    content.push({ text: formattedBarcode, style: 'barcodeText', margin: [0, 0, 0, 14] })

    content.push({ text: 'Instrucoes FEBRABAN', style: 'sectionTitle' })
    content.push({
      text: 'Pague este boleto em qualquer banco, casa loterica ou internet banking ate a data de vencimento. Depois do vencimento, a cobertura esta sujeita a juros e multa conforme acordado.',
      style: 'importantNote',
      margin: [0, 0, 0, 14]
    })
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 34, 36, 40],
    content,
    footer(currentPage: number, pageCount: number) {
      return buildFooterBlock(currentPage, pageCount, branding, documentTitle)
    },
    styles: defaultStyles(),
    defaultStyle: { color: PDF_COLORS.text }
  }

  return docDefinition
}

export async function exportInvoicePdf(invoice: any, fileName: string) {
  const [pdfMake, branding] = await Promise.all([getPdfMake(), loadPdfBranding()])
  const docDefinition = await buildInvoiceDocument(invoice, branding)
  pdfMake.createPdf(docDefinition).download(fileName)
}

export async function exportBoletoPdf(invoice: any, fileName: string) {
  const [pdfMake, branding] = await Promise.all([getPdfMake(), loadPdfBranding()])
  const docDefinition = await buildBoletoDocument(invoice, branding)
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
  const orderTravelCost = Number(order?.travelCost || 0)
  const orderGrandTotal = Number(order?.total || 0)
  const orderItemsSubtotal = Math.max(Number((orderGrandTotal - orderTravelCost).toFixed(2)), 0)

  const summaryRows = [
    { label: 'OS', value: normalizeText(order?.id) },
    { label: 'Titulo', value: normalizeText(order?.title) },
    { label: 'Status', value: statusLabel(order?.status) },
    { label: 'Prioridade', value: priorityLabel(order?.priority) },
    { label: 'Subtotal itens', value: formatCurrency(orderItemsSubtotal) },
    { label: 'Deslocamento', value: formatCurrency(orderTravelCost) },
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

  const vehicleRows = [
    { label: 'Placa', value: normalizeText(order?.vehicle?.plate) },
    { label: 'Marca', value: normalizeText(order?.vehicle?.brand) },
    { label: 'Modelo', value: normalizeText(order?.vehicle?.model) },
    { label: 'Cor', value: normalizeText(order?.vehicle?.color) },
    { label: 'Ano', value: normalizeText(order?.vehicle?.modelYear) },
    { label: 'KM', value: normalizeText(order?.vehicle?.mileage) }
  ]

  const itemRows = Array.isArray(order?.items) ? order.items : []
  const invoiceRows = Array.isArray(order?.invoices) ? order.invoices : []
  const itemsAmountTotal = itemRows.reduce((sum: number, item: any) => sum + Number(item?.total || 0), 0)
  const invoicesAmountTotal = invoiceRows.reduce((sum: number, invoice: any) => sum + Number(invoice?.total || 0), 0)

  const itemsTableBody = [
    [
      { text: 'Tipo', style: 'tableHeader' },
      { text: 'Descricao', style: 'tableHeader' },
      { text: 'Qtd', style: 'tableHeader' },
      { text: 'Unitario', style: 'tableHeader' },
      { text: 'Total', style: 'tableHeader' }
    ],
    ...itemRows.map((item: any) => [
      { text: itemTypeLabel(item?.itemType), style: 'tableBody' },
      { text: normalizeText(item?.description || item?.service?.name || item?.material?.name), style: 'tableBody' },
      { text: normalizeText(item?.quantity), style: 'tableBody' },
      { text: formatCurrency(item?.unitPrice), style: 'tableBody' },
      { text: formatCurrency(item?.total), style: 'tableBody' }
    ])
  ]

  const invoicesTableBody = [
    [
      { text: 'Fatura', style: 'tableHeader' },
      { text: 'Status', style: 'tableHeader' },
      { text: 'Boleto', style: 'tableHeader' },
      { text: 'Vencimento', style: 'tableHeader' },
      { text: 'Total', style: 'tableHeader' }
    ],
    ...invoiceRows.map((invoice: any) => [
      { text: normalizeText(invoice?.code || invoice?.id), style: 'tableBody' },
      { text: invoiceStatusLabel(invoice?.status), style: 'tableBody' },
      { text: invoice?.boleto ? boletoStatusLabel(invoice?.boleto?.status) : 'Sem boleto', style: 'tableBody' },
      { text: formatDateTime(invoice?.dueDate || invoice?.createdAt), style: 'tableBody' },
      { text: formatCurrency(invoice?.total), style: 'tableBody' }
    ])
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
              },
              { text: 'Veiculo', style: 'sectionTitle', margin: [0, 12, 0, 8] },
              {
                table: {
                  widths: ['auto', '*'],
                  body: vehicleRows.map(item => [
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
      { text: 'Itens da OS', style: 'sectionTitle' },
      itemRows.length === 0
        ? { text: 'Nenhum item detalhado na OS.', style: 'label', margin: [0, 0, 0, 12] }
        : {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: itemsTableBody
            },
            layout: baseLayout(),
            margin: [0, 0, 0, 6]
          },
      {
        text: `Total dos itens: ${formatCurrency(itemsAmountTotal)}`,
        style: 'value',
        margin: [0, 0, 0, 3]
      },
      {
        text: `Custo de deslocamento: ${formatCurrency(orderTravelCost)}`,
        style: 'value',
        margin: [0, 0, 0, 3]
      },
      {
        text: `Total final da OS: ${formatCurrency(orderGrandTotal)}`,
        style: 'value',
        margin: [0, 0, 0, 14]
      },
      { text: 'Faturas e boletos', style: 'sectionTitle' },
      invoiceRows.length === 0
        ? { text: 'Nenhuma fatura registrada para esta OS.', style: 'label', margin: [0, 0, 0, 12] }
        : {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: invoicesTableBody
            },
            layout: baseLayout(),
            margin: [0, 0, 0, 6]
          },
      {
        text: `Total das faturas: ${formatCurrency(invoicesAmountTotal)}`,
        style: 'value',
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
