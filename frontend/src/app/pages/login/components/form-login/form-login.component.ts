import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import { Login } from '../../../../models/login'
import { LoginService } from '../../../../services/login.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent implements OnInit {
  @Input()
  usuario:string =""
  @Input() // mudar os input para o login principal
  senha:string =""

  login:Login

  constructor(private loginService: LoginService, private router: Router) {
    this.login = {
      usuario:'',
      senha:''
    }
  }

  logar(f: NgForm) { // fazer essa logica de login buscando no backend
    console.log('logando...')
    const json = { usuario: f.value['usuario'], senha: f.value['senha']}
    console.log('recebendo dados...')

    this.loginService.validarLogin(json).subscribe(
      (response: Login) => {
        console.log('validando dados...')
        console.log('Login bem-sucedido:', response);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Erro ao fazer login:', error);
      }
    )
  }

  ngOnInit(): void { }

}
