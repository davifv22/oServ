import { Component, OnInit } from '@angular/core'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { UserService } from '../../../services/user.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'

@Component({
    selector: 'app-funcionarios',
    standalone: true,
    templateUrl: './funcionarios.component.html',
    styleUrl: './funcionarios.component.css',
    imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule]
})
export class FuncionariosComponent implements OnInit {
  title:string = ''
  Users: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.title = 'FUNCIONÁRIOS'
    this.per_page = 20
    this.getUsuarios(1, this.per_page)
  }

  getUsuarios(page:number, per_page:number) {
    this.userService.getUsers(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Users = data.results
    })
  }

  searchUsuarios() {
    this.userService.getUsers(0, 0, false).subscribe(data => {
      this.Users = data
      if (this.search !== '') {
        this.Users = this.Users.filter(usuario =>
          usuario.nome.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getUsuarios(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Users = this.Users.filter(usuario =>
        usuario.nome.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getUsuarios(1, this.per_page)
      }
    }
}
