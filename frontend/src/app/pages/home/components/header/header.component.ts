import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user'
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  User:User

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {
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
