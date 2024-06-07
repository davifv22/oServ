import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Empresa } from '../../models/empresa'
import { EmpresaService } from '../../services/parametrizacao/empresa.service';
import { Usuarios } from '../../models/usuarios'
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, MatBadgeModule, MatDividerModule, MatListModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public horarioAtual: Date;
  User:Usuarios
  Empresa:Empresa

  constructor(private userService: UserService, private empresaService: EmpresaService, private authService: AuthService, private router: Router) {
    this.User = {
      idUser:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      isAdmin:false,
      apiKey:''
    }
    this.Empresa = {
      idEmpresa:0,
      nomeEmpresa:'',
      dtRefSistema:'',
      dtImplantacao:'',
      endereco:[],
      cidade:'',
      cnpj:''
    }
    this.horarioAtual = new Date();
   }

   ngOnInit(): void {
    this.getUsuario();
    this.getEmpresa();

    interval(1000).subscribe(() => {
      this.atualizarHorario();
    });
   }

   private atualizarHorario() {
    this.horarioAtual = new Date();
  }

   sair() {
    if (this.authService.logout()) {
      this.router.navigate(['login'])
    }
   }

   getUsuario(){
    this.userService.getUser().subscribe(
      {
        next: (res) => {
          this.User = {
            idUser: res.idUser,
            nome: res.nome,
            user: res.user,
            email: res.email,
            situacao: res.situacao,
            isAdmin: res.isAdmin,
            apiKey: res.apiKey
          }
        },
        error: (err) => console.log('not found')
      }
    )
   }

   getEmpresa(){
    this.empresaService.getEmpresa().subscribe(
      {
        next: (res) => {
          console.log(res.dtRefSistema)
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
