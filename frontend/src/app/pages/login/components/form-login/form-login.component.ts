import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Login } from '../../../../models/login'
import { User } from '../../../../models/user'
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { LoginComponent } from '../../login.component';
@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent implements OnInit {
  error:string = ''
  result:User

  constructor(private authService: AuthService, private router: Router) {
    this.result = {
      id:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      is_admin:false,
      api_key:''
    }
  }

  logar(f: NgForm) {
    const json = { usuario: f.value['usuario'], senha: f.value['senha'], is_logged_in: true}

    this.authService.login(json).subscribe(
        (response: Login) => {
          this.result = JSON.parse(`${JSON.stringify(response)}`);
          sessionStorage.setItem('id', `${this.result.id}`)
          sessionStorage.setItem('nome', `${this.result.nome}`)
          sessionStorage.setItem('user', `${this.result.user}`)
          sessionStorage.setItem('email', `${this.result.email}`)
          sessionStorage.setItem('is_admin', `${this.result.is_admin}`)
          sessionStorage.setItem('api_key', `${this.result.api_key}`)
          sessionStorage.setItem('is_logged_in', 'true')
          this.router.navigate([''])
        },
        (error) => {
          this.error = `${error.error.message}`
        }
    )
}

  ngOnInit(): void { }

}
