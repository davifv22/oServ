import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Login } from '../../models/login'
import { Usuarios } from '../../models/usuarios'
import { AuthService } from '../../services/auth.service';
import { ValidationsService } from '../../services/validations.service';
import { Router } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DeploymentAccessComponent } from './deployment-access/deployment-access.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDividerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  error:string = ''
  result:Usuarios

  constructor(private authService: AuthService, private validationsService: ValidationsService, private router: Router, public modal: MatDialog) {
    this.result = {
      idUser:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      isAdmin:false,
      apiKey:''
    }
  }

  ngOnInit(): void {
    sessionStorage.clear()
    this.initial_validations()
  }

  initial_validations() {
    this.validationsService.validations_db().subscribe(
      (response) => {
        if (response === false) {
          this.openDialog()
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  openDialog(): void {
    this.modal.open(DeploymentAccessComponent, { disableClose: true });
  }

  logar(f: NgForm) {
    const json = {
      usuario: f.value['usuario'],
      senha: f.value['senha'],
      is_logged_in: true
    }
    this.authService.login(json).subscribe(
        (response: Login) => {
          this.result = JSON.parse(`${JSON.stringify(response)}`);
          sessionStorage.setItem('idUser', `${this.result.idUser}`)
          sessionStorage.setItem('nome', `${this.result.nome}`)
          sessionStorage.setItem('user', `${this.result.user}`)
          sessionStorage.setItem('email', `${this.result.email}`)
          sessionStorage.setItem('isAdmin', `${this.result.isAdmin}`)
          sessionStorage.setItem('apiKey', `${this.result.apiKey}`)
          sessionStorage.setItem('is_logged_in', 'true')
          this.router.navigate([''])
        },
        (error) => {
          this.error = `${error.error.message}`
        }
    )
  }
}
