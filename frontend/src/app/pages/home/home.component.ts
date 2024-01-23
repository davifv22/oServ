import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginService } from '../../services/login.service';
import { User } from '../../models/user'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  User:User

  constructor(private userService: UserService, private loginService: LoginService) {
    this.User = {
      id:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      is_admin:false,
      api_key:''
    }
   }
   ngOnInit(): void {
    this.getUsuario();
   }

   getUsuario(){
    this.userService.getUser().subscribe(
      {
        next: (res) => {
          this.User = {
            id: res.id,
            nome: res.nome,
            user: res.user,
            email: res.email,
            situacao: res.situacao,
            is_admin: res.is_admin,
            api_key: res.api_key
          }
        },
        error: (err) => console.log('not found')
      }
    )
   }
}

