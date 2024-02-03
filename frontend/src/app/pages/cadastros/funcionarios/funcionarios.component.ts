import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-funcionarios',
    standalone: true,
    templateUrl: './funcionarios.component.html',
    styleUrl: './funcionarios.component.css',
    imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule]
})
export class FuncionariosComponent implements OnInit {
  Users: any[] = [];
  title:string = ''
  paginate: any[] = [];
  per_page:number = 20

  search:string = ''


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.title = 'FUNCIONÁRIOS'
    this.getUsuarios();
  }

   getUsuarios(page = 1, per_page = this.per_page){
    this.userService.getUsers(page, per_page).subscribe(data => {
      this.paginate = Object.values(data)
      this.Users = data.results;
    })
   }

   search_user() {
    if (this.search === '') {
      this.getUsuarios(1, this.per_page)
    } else {
      this.Users = this.Users.filter(usuario =>
        usuario.nome.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }

   onSelecaoPer_page() {
    this.getUsuarios(1, this.per_page)
  }
}
