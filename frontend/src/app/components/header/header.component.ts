import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user'
import { Router } from '@angular/router';
import { interval } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public horarioAtual: Date;
  User:User

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {
    this.User = {
      idUser:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      isAdmin:false,
      apiKey:''
    }
    this.horarioAtual = new Date();
   }

   ngOnInit(): void {
    this.getUsuario();

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
}
