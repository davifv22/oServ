function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0)
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
}

async function getPdfMake() {
  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule
  const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule
  pdfMake.vfs = pdfFonts.vfs || pdfFonts
  return pdfMake
}

function getDocumentHeader(title: string) {
  return {
    columns: [
      { text: title, style: 'headerLeft' },
      { text: new Date().toLocaleDateString('pt-BR'), alignment: 'right', style: 'headerRight' }
    ],
    margin: [0, 0, 0, 16]
  }
}

function getDefaultStyles() {
  return {
    header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
    subheader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
    tableHeader: { bold: true, fontSize: 10, color: '#ffffff', fillColor: '#22b8cf', margin: [0, 4, 0, 4] },
    tableBody: { fontSize: 10, margin: [0, 4, 0, 4] },
    headerLeft: { fontSize: 14, bold: true },
    headerRight: { fontSize: 10, color: '#6b7280' },
    footer: { fontSize: 8, italics: true, alignment: 'center' }
  }
}

function buildTableBody(headers: string[], keys: string[], rows: any[]) {
  const body = [headers.map(title => ({ text: title, style: 'tableHeader' }))]
  rows.forEach(row => {
    body.push(keys.map(key => ({ text: row[key] != null ? String(row[key]) : '-', style: 'tableBody' })))
  })
  return body
}

export async function exportListPdf(title: string, headers: string[], keys: string[], rows: any[], fileName: string) {
  const pdfMake = await getPdfMake()
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 36, 36, 36],
    header: getDocumentHeader(title),
    footer(currentPage: number, pageCount: number) {
      return { text: `Página ${currentPage} de ${pageCount}`, style: 'footer' }
    },
    content: [
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: buildTableBody(headers, keys, rows)
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#22b8cf' : rowIndex % 2 === 0 ? '#f4f6f8' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#d1d5db',
          vLineColor: () => '#d1d5db',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      }
    ],
    styles: getDefaultStyles()
  }

  pdfMake.createPdf(docDefinition).download(fileName)
}

export async function exportServiceOrderPdf(order: any, comments: any[], fileName: string) {
  const pdfMake = await getPdfMake()
  const orderFields = [
    { label: 'ID da OS', value: order.id || '-' },
    { label: 'Título', value: order.title || '-' },
    { label: 'Status', value: String(order.status || '-') },
    { label: 'Prioridade', value: String(order.priority || '-') },
    { label: 'Cliente', value: order.customer?.name || '-' },
    { label: 'Responsável', value: order.responsibleEmployee?.name || '-' },
    { label: 'Total', value: formatCurrency(order.total) },
    { label: 'Criada em', value: order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : '-' },
    { label: 'Atualizada em', value: order.updatedAt ? new Date(order.updatedAt).toLocaleString('pt-BR') : '-' }
  ]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 36, 36, 36],
    header: getDocumentHeader('Ordem de Serviço'),
    footer(currentPage: number, pageCount: number) {
      return { text: `Página ${currentPage} de ${pageCount}`, style: 'footer' }
    },
    content: [
      { text: 'Resumo da OS', style: 'subheader' },
      {
        table: {
          widths: ['auto', '*'],
          body: orderFields.map(item => [
            { text: item.label, bold: true, margin: [0, 4, 0, 4] },
            { text: item.value, margin: [0, 4, 0, 4] }
          ])
        },
        layout: 'noBorders'
      },
      { text: 'Descrição', style: 'subheader', margin: [0, 16, 0, 8] },
      { text: order.description || 'Sem descrição informada.', margin: [0, 0, 0, 8] },
      { text: 'Comentários', style: 'subheader', margin: [0, 16, 0, 8] },
      comments.length === 0
        ? { text: 'Nenhum comentário registrado.', italics: true }
        : {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: 'Autor', style: 'tableHeader' },
                { text: 'Comentário', style: 'tableHeader' },
                { text: 'Data', style: 'tableHeader' }
              ],
              ...comments.map(comment => [
                { text: comment.author?.name || 'Sistema', style: 'tableBody' },
                { text: comment.message || '-', style: 'tableBody' },
                { text: comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR') : '-', style: 'tableBody' }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#22b8cf' : rowIndex % 2 === 0 ? '#f4f6f8' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#d1d5db',
            vLineColor: () => '#d1d5db',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        }
    ],
    styles: getDefaultStyles()
  }

  pdfMake.createPdf(docDefinition).download(fileName)
}
