import { Component, OnInit } from '@angular/core'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { ClientesService } from '../../../services/cadastros/clientes.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  title:string = ''
  Clientes: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''


  constructor(private clientesService: ClientesService) { }

  ngOnInit(): void {
    this.title = 'CLIENTES'
    this.per_page = 20
    this.getClientes(1, this.per_page)
  }

  getClientes(page:number, per_page:number) {
    this.clientesService.getClientes(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Clientes = data.results
    })
  }

  searchClientes() {
    this.clientesService.getClientes(0, 0, false).subscribe(data => {
      this.Clientes = data
      if (this.search !== '') {
        this.Clientes = this.Clientes.filter(clientes =>
          clientes.nome.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getClientes(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Clientes = this.Clientes.filter(usuario =>
        usuario.nome.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getClientes(1, this.per_page)
      }
    }
}
