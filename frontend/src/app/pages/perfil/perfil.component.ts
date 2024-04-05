import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Usuarios } from '../../models/usuarios'
import { UserService } from '../../services/user.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';

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

  constructor(private userService: UserService, private http: HttpClient) {
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

  // if (file) {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   this.http.post('http://localhost:3000/api/upload', formData).subscribe(
  //     (response) => {
  //       console.log(response);
  //     },
  //     (error) => {
  //       console.error('Erro ao enviar o arquivo:', error);
  //     }
  //   );
  // }

  reader.onload = (e: any) => {
    this.previewUrl = e.target.result;
  };

  reader.readAsDataURL(file);
 }
}
