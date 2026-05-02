import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { OrdemServicoPrintData, PrintService } from '../../services/print.service';

@Component({
  selector: 'app-gestao',
  standalone: true,
  imports: [SubMenuComponent, CommonModule, MatCardModule],
  templateUrl: './gestao.component.html',
  styleUrl: './gestao.component.css'
})
export class GestaoComponent implements OnInit {
  title:string = ''

  constructor(private printService: PrintService) { }

  ngOnInit(): void {
    this.title = 'GESTÃO OSERV'
  }

  imprimirOrdemServico(ordemServico?: OrdemServicoPrintData): void {
    const dadosImpressao = ordemServico ?? {
      numero: '0001',
      dataAbertura: new Date().toLocaleDateString('pt-BR'),
      previsaoEntrega: '',
      status: 'Aberta',
      cliente: 'Cliente não informado',
      telefone: '',
      documento: '',
      endereco: '',
      veiculo: '',
      placa: '',
      km: '',
      responsavel: '',
      defeitoRelatado: 'Descreva aqui o problema relatado pelo cliente.',
      observacao: 'Modelo de impressão. Substitua estes dados pelos dados retornados da API da ordem de serviço.',
      itens: [
        {
          descricao: 'Serviço a executar',
          quantidade: 1,
          valorUnitario: 0,
          valorTotal: 0
        }
      ],
      valorTotal: 0
    };

    this.printService.printOrdemServico(dadosImpressao);
  }
}
