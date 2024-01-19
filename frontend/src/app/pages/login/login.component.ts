import { Component, OnInit } from '@angular/core';
import { FormLoginComponent } from './components/form-login/form-login.component'
import { Login } from '../../models/login'
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  login:Login

  constructor(private loginService: LoginService) {
    this.login = {
      usuario:'',
      senha:''
    }
  }

  ngOnInit(): void {
    this.authLogin()
  }

  authLogin(){
    this.loginService.getLogin().subscribe(
      {
        next: (res) => {

          this.login = {
            usuario: res.usuario,
            senha: res.senha
          }
        },
        error: (err) => console.log('not found')
      }
    )
  }
}
