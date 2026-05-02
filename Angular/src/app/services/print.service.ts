import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as { vfs?: unknown }).vfs = (pdfFonts as { pdfMake?: { vfs?: unknown }, vfs?: unknown }).pdfMake?.vfs ?? (pdfFonts as { vfs?: unknown }).vfs;

export type PrintColumn<T> = {
  label: string;
  field: keyof T | ((row: T) => string | number | boolean | null | undefined);
  width?: string | number | 'auto' | '*';
};

export type OrdemServicoPrintItem = {
  descricao: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
};

export type OrdemServicoPrintData = {
  numero?: string | number;
  dataAbertura?: string;
  previsaoEntrega?: string;
  status?: string;
  cliente?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  veiculo?: string;
  placa?: string;
  km?: string | number;
  responsavel?: string;
  defeitoRelatado?: string;
  observacao?: string;
  itens?: OrdemServicoPrintItem[];
  valorTotal?: number;
};

@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly companyName = 'oServ - Gestão Ordem de Serviço';

  printList<T extends object>(title: string, columns: PrintColumn<T>[], data: T[]): void {
    const body = [
      columns.map((column) => ({ text: column.label, style: 'tableHeader' })),
      ...data.map((row) => columns.map((column) => this.formatValue(this.resolveValue(row, column.field))))
    ];

    const documentDefinition: TDocumentDefinitions = {
      pageOrientation: 'landscape',
      pageMargins: [25, 70, 25, 35],
      header: this.buildHeader(title),
      footer: this.buildFooter(),
      content: [
        { text: `Total de registros: ${data.length}`, style: 'summary' },
        {
          table: {
            headerRows: 1,
            widths: columns.map((column) => column.width ?? '*'),
            body
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: this.styles()
    };

    pdfMake.createPdf(documentDefinition).open({}, window.open('', '_blank'));
  }

  printOrdemServico(data: OrdemServicoPrintData): void {
    const itens = data.itens?.length ? data.itens : [{ descricao: 'Serviço / Produto', quantidade: 1, valorUnitario: data.valorTotal ?? 0, valorTotal: data.valorTotal ?? 0 }];
    const total = data.valorTotal ?? itens.reduce((sum, item) => sum + Number(item.valorTotal ?? 0), 0);

    const documentDefinition: TDocumentDefinitions = {
      pageMargins: [35, 80, 35, 45],
      header: this.buildHeader(`ORDEM DE SERVIÇO ${data.numero ? `#${data.numero}` : ''}`),
      footer: this.buildFooter(),
      content: [
        this.sectionTitle('Dados da OS'),
        this.infoTable([
          ['Número', this.formatValue(data.numero), 'Status', this.formatValue(data.status)],
          ['Abertura', this.formatValue(data.dataAbertura), 'Previsão', this.formatValue(data.previsaoEntrega)],
          ['Responsável', this.formatValue(data.responsavel), '', '']
        ]),

        this.sectionTitle('Cliente'),
        this.infoTable([
          ['Nome', this.formatValue(data.cliente), 'Telefone', this.formatValue(data.telefone)],
          ['Documento', this.formatValue(data.documento), 'Endereço', this.formatValue(data.endereco)]
        ]),

        this.sectionTitle('Veículo / Equipamento'),
        this.infoTable([
          ['Veículo', this.formatValue(data.veiculo), 'Placa', this.formatValue(data.placa)],
          ['KM', this.formatValue(data.km), '', '']
        ]),

        this.sectionTitle('Relato / Observações'),
        { text: data.defeitoRelatado || 'Não informado', margin: [0, 0, 0, 8] },
        { text: data.observacao || '', margin: [0, 0, 0, 12] },

        this.sectionTitle('Itens da Ordem de Serviço'),
        {
          table: {
            headerRows: 1,
            widths: ['*', 55, 75, 75],
            body: [
              [
                { text: 'Descrição', style: 'tableHeader' },
                { text: 'Qtd.', style: 'tableHeader' },
                { text: 'Vlr. Unit.', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...itens.map((item) => [
                item.descricao,
                this.formatValue(item.quantidade),
                this.formatCurrency(item.valorUnitario),
                this.formatCurrency(item.valorTotal)
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: `Total: ${this.formatCurrency(total)}`, style: 'total' },

        {
          columns: [
            { text: '__________________________________\nAssinatura do cliente', alignment: 'center' },
            { text: '__________________________________\nResponsável técnico', alignment: 'center' }
          ],
          margin: [0, 45, 0, 0]
        }
      ],
      styles: this.styles()
    };

    pdfMake.createPdf(documentDefinition).open({}, window.open('', '_blank'));
  }

  private buildHeader(title: string) {
    return () => ({
      margin: [25, 20, 25, 0],
      columns: [
        { text: this.companyName, bold: true, fontSize: 13 },
        { text: title, alignment: 'right', bold: true, fontSize: 12 }
      ]
    });
  }

  private buildFooter() {
    return (currentPage: number, pageCount: number) => ({
      margin: [25, 0, 25, 15],
      columns: [
        { text: `Emitido em ${new Date().toLocaleString('pt-BR')}`, fontSize: 8 },
        { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8 }
      ]
    });
  }

  private resolveValue<T>(row: T, field: PrintColumn<T>['field']): unknown {
    return typeof field === 'function' ? field(row) : row[field];
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Ativo' : 'Suspenso';
    return String(value);
  }

  private formatCurrency(value: unknown): string {
    const numberValue = Number(value ?? 0);
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private sectionTitle(text: string): Content {
    return { text, style: 'sectionTitle' };
  }

  private infoTable(rows: string[][]): Content {
    return {
      table: {
        widths: [80, '*', 80, '*'],
        body: rows.map((row) => [
          { text: row[0], bold: true },
          row[1],
          { text: row[2], bold: true },
          row[3]
        ])
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    };
  }

  private styles(): TDocumentDefinitions['styles'] {
    return {
      tableHeader: { bold: true, fillColor: '#eeeeee', fontSize: 9 },
      summary: { margin: [0, 0, 0, 8], fontSize: 9 },
      sectionTitle: { bold: true, fontSize: 12, margin: [0, 12, 0, 6] },
      total: { bold: true, alignment: 'right', margin: [0, 10, 0, 0], fontSize: 12 }
    };
  }
}
