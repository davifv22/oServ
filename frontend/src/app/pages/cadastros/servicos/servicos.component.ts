import { Component, OnInit } from '@angular/core';
import { ServicosService } from '../../../services/cadastros/servicos.service';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent implements OnInit {
  title:string = ''
  Servicos: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''

  constructor(private servicosService: ServicosService) { }

  ngOnInit(): void {
    this.title = 'SERVIÇOS'
    this.per_page = 20
    this.getServicos(1, this.per_page)
  }

  getServicos(page:number, per_page:number) {
    this.servicosService.getServicos(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Servicos = data.results
    })
  }

  searchServicos() {
    this.servicosService.getServicos(0, 0, false).subscribe(data => {
      this.Servicos = data
      if (this.search !== '') {
        this.Servicos = this.Servicos.filter(servicos =>
          servicos.descricao.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getServicos(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Servicos = this.Servicos.filter(servicos =>
        servicos.descricao.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getServicos(1, this.per_page)
      }
    }
}
