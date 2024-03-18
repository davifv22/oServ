import { Component, OnInit } from '@angular/core';
import { TipoRequerimentoService } from '../../../services/tipo-requerimento.service';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-tipo-requerimento',
    standalone: true,
    templateUrl: './tipo-requerimento.component.html',
    styleUrl: './tipo-requerimento.component.css',
    imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule]
})
export class TipoRequerimentoComponent implements OnInit {
  title:string = ''
  TipoRequerimentos: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''


  constructor(private tipoRequerimentoService: TipoRequerimentoService) { }

  ngOnInit(): void {
    this.title = 'TIPO DE REQUERIMENTO'
    this.per_page = 20
    this.getTipoRequerimentos(1, this.per_page)
  }

  getTipoRequerimentos(page:number, per_page:number) {
    this.tipoRequerimentoService.getTipoRequerimento(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.TipoRequerimentos = data.results
    })
  }

  searchTipoRequerimento() {
    this.tipoRequerimentoService.getTipoRequerimento(0, 0, false).subscribe(data => {
      this.TipoRequerimentos = data
      if (this.search !== '') {
        this.TipoRequerimentos = this.TipoRequerimentos.filter(tipoRequerimentos =>
          tipoRequerimentos.descricao.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getTipoRequerimentos(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.TipoRequerimentos = this.TipoRequerimentos.filter(tipoRequerimentos =>
        tipoRequerimentos.descricao.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getTipoRequerimentos(1, this.per_page)
      }
    }
}
