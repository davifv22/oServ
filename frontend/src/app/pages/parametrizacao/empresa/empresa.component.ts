import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Empresa } from '../../../models/empresa'
import { EmpresaService } from '../../../services/parametrizacao/empresa.service';
@Component({
    selector: 'app-empresa',
    standalone: true,
    templateUrl: './empresa.component.html',
    styleUrl: './empresa.component.css',
    imports: [CommonModule, FormsModule]
})
export class EmpresaComponent implements OnInit {
  Empresa:Empresa

  constructor(private empresaService: EmpresaService) {
    this.Empresa = {
      idEmpresa:0,
      nomeEmpresa:'',
      dtRefSistema:'',
      dtImplantacao:'',
      endereco:[],
      cidade:'',
      cnpj:''
    }
  }

  ngOnInit(): void {
    this.getEmpresa();
  }

  getEmpresa(){
    this.empresaService.getEmpresa().subscribe(
      {
        next: (res) => {
          console.log(res);
          this.Empresa = {
            idEmpresa: res.idEmpresa,
            nomeEmpresa: res.nomeEmpresa,
            dtRefSistema: res.dtRefSistema,
            dtImplantacao: res.dtImplantacao,
            endereco: res.endereco.split(','),
            cidade: res.cidade.split(','),
            cnpj: res.cnpj
          }
        },
        error: (err) => console.log('not found')
      }
    )
   }

   insertEmpresa(f: NgForm) {
    const json = {
      nomeEmpresa: f.value['nomeEmpresa'],
      dtRefSistema: f.value['dtRefSistema'],
      endereco: `${f.value['logradouro']}, ${f.value['numero']}, ${f.value['bairro']}`,
      cidade: `${f.value['cidade']}, ${f.value['uf']}`,
      cnpj: f.value['cnpj'],
      dtImplantacao: f.value['dtImplantacao'],
    }
    console.log(json)
  }
}
