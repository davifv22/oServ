import { Component, OnInit } from '@angular/core';
import { PreOrcamentoService } from '../../../services/cadastros/pre-orcamento.service';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-pre-orcamento',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule],
  templateUrl: './pre-orcamento.component.html',
  styleUrl: './pre-orcamento.component.css'
})
export class PreOrcamentoComponent implements OnInit {
  title:string = ''
  PreOrcamentos: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''

  constructor(private preOrcamentoService: PreOrcamentoService) { }

  ngOnInit(): void {
    this.title = 'PRÉ ORÇAMENTO'
    this.per_page = 20
    this.getPreOrcamento(1, this.per_page)
  }

  getPreOrcamento(page:number, per_page:number) {
    this.preOrcamentoService.getPreOrcamento(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.PreOrcamentos = data.results
    })
  }

  searchPreOrcamento() {
    this.preOrcamentoService.getPreOrcamento(0, 0, false).subscribe(data => {
      this.PreOrcamentos = data
      if (this.search !== '') {
        this.PreOrcamentos = this.PreOrcamentos.filter(preOrcamento =>
          preOrcamento.idTipoRequerimento.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getPreOrcamento(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.PreOrcamentos = this.PreOrcamentos.filter(preOrcamento =>
        preOrcamento.idTipoRequerimento.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getPreOrcamento(1, this.per_page)
      }
    }
}
