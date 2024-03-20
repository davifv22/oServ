import { Component, Input, OnInit } from '@angular/core';
import { Empresa } from '../../models/empresa'
import { EmpresaService } from '../../services/parametrizacao/empresa.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
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

}
