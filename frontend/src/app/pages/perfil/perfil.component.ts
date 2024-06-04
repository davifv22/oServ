import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Usuarios } from '../../models/usuarios'
import { UserService } from '../../services/user.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SubMenuComponent, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  title:string = ''
  User:Usuarios
  result: any;

  constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar) {
    this.User = {
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
    this.title = 'PERFIL'
    this.getUsuario();
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


previewUrl: string | ArrayBuffer | null = null;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e: any) => {
    this.previewUrl = e.target.result;
  };

  reader.readAsDataURL(file);
 }

 postUsuario(f: NgForm) {
  const json = {
    nome:f.value['nome'],
    user:f.value['user'],
    email:f.value['email'],
    senha:f.value['senha']
  }


  this.userService.postUser(json).subscribe(
    {
      next: (usuario) => {
        this.User = JSON.parse(`${JSON.stringify(usuario)}`);
        sessionStorage.setItem('nome', `${this.User.nome}`)
        sessionStorage.setItem('user', `${this.User.user}`)
        sessionStorage.setItem('email', `${this.User.email}`)
        this.router.navigate(['/perfil'])
        this._snackBar.open('✔️ Alterações feitas com sucesso!', 'Ok!', {
          duration: 3000
        });
      },
      error: (err) => {
        this._snackBar.open('❌ Não foi possível alterar!', 'Ok!', {
          duration: 3000
        });
      }
    }
  )
}
}
