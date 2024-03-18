import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
    selector: 'app-empresa',
    standalone: true,
    templateUrl: './empresa.component.html',
    styleUrl: './empresa.component.css',
    imports: [CommonModule, FormsModule]
})
export class EmpresaComponent implements OnInit {
  @Input()
  nomeEmpresa: string
  @Input()
  dtRefSistema: string
  @Input()
  endereco: string
  @Input()
  cidade: string
  @Input()
  cnpj: string
  @Input()
  dtImplantacao: string

  constructor() {
    this.nomeEmpresa = ''
    this.dtRefSistema = ''
    this.endereco = ''
    this.cidade = ''
    this.cnpj = ''
    this.dtImplantacao = ''
  }

  ngOnInit(): void {
    this.nomeEmpresa = 'Maikim Ar-condicionados'
    this.dtRefSistema = '2024-03'
    this.endereco = 'Rua dos Piantinos, 20 - Jardim Panorama'
    this.cidade = 'Passos, MG'
    this.cnpj = '12.345.678/0001-00'
    this.dtImplantacao = '2024-01-01'
  }

  insertEmpresa(f: NgForm) {
    const json = {
      nomeEmpresa: f.value['nomeEmpresa'],
      dtRefSistema: f.value['dtRefSistema'],
      endereco: f.value['endereco'],
      cidade: f.value['cidade'],
      cnpj: f.value['cnpj'],
      dtImplantacao: f.value['dtImplantacao'],
    }
    console.log(json)
  }
}
