import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Empresa } from '../../../models/empresa'
import { EmpresaService } from '../../../services/parametrizacao/empresa.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
@Component({
    selector: 'app-empresa',
    standalone: true,
    templateUrl: './empresa.component.html',
    styleUrl: './empresa.component.css',
    imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatButtonModule],
    providers: [provideNativeDateAdapter()]
})
export class EmpresaComponent implements OnInit {
  Empresa:Empresa

  constructor(private empresaService: EmpresaService) {
    this.Empresa = {
      idEmpresa:0,
      nomeEmpresa:'',
      dtRefSistema:'',
      dtImplantacao: '',
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
          this.Empresa = {
            idEmpresa: res.idEmpresa,
            nomeEmpresa: res.nomeEmpresa,
            dtRefSistema: res.dtRefSistema,
            dtImplantacao: res.dtImplantacao,
            endereco: res.endereco.split(', '),
            cidade: res.cidade.split(', '),
            cnpj: res.cnpj
          }
        },
        error: (err) => console.log('not found')
      }
    )
   }

   postEmpresa(f: NgForm) {
    const json = {
      nomeEmpresa: f.value['nomeEmpresa'],
      dtRefSistema: f.value['dtRefSistema'],
      endereco: `${f.value['logradouro']}, ${f.value['numero']}, ${f.value['bairro']}`,
      cidade: `${f.value['cidade']}, ${f.value['uf']}`,
      cnpj: f.value['cnpj'],
      dtImplantacao: f.value['dtImplantacao'],
    }
    this.empresaService.postEmpresa(json).subscribe(
      (response) => {
        return window.location.reload()
      },
      (error) => {
        return error.message
      }
    )
  }
}
