import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import { Login } from '../../../../models/login'
import { LoginService } from '../../../../services/login.service';
import { AuthService } from '../../../../services/auth.service';
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
  usuario:string = ''
  @Input()
  senha:string = ''

  error:string = ''

  login:Login

  constructor(private loginService: LoginService, private authService: AuthService, private router: Router) {
    this.login = {
      usuario:'',
      senha:''
    }
  }

  logar(f: NgForm) {
    const json = { usuario: f.value['usuario'], senha: f.value['senha']}

    this.loginService.validarLogin(json).subscribe(
        (response: Login) => {
          console.log('Login bem-sucedido:', response);

          try {
            this.authService.login(f.value['usuario'], f.value['senha'])
            sessionStorage.setItem('usuario', JSON.stringify(response));
            this.router.navigate(['/'])
          } catch (error) {
            console.error('Erro na autenticação!');
          }
        },
        (error) => {
          this.error = `${error.error.message}`
        }
    )
}

  ngOnInit(): void { }

}
