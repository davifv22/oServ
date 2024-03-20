import { Component, OnInit } from '@angular/core';
import { VeiculosService } from '../../../services/cadastros/veiculos.service';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.css'
})
export class VeiculosComponent implements OnInit {
  title:string = ''
  Veiculos: any[] = []
  paginate: any[] = []
  per_page:number = 0
  search:string = ''

  constructor(private veiculosService: VeiculosService) { }

  ngOnInit(): void {
    this.title = 'VEICULOS'
    this.per_page = 20
    this.getVeiculos(1, this.per_page)
  }

  getVeiculos(page:number, per_page:number) {
    this.veiculosService.getVeiculos(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Veiculos = data.results
    })
  }

  searchVeiculos() {
    this.veiculosService.getVeiculos(0, 0, false).subscribe(data => {
      this.Veiculos = data
      if (this.search !== '') {
        this.Veiculos = this.Veiculos.filter(veiculos =>
          veiculos.placa.toLowerCase().includes(this.search.toLowerCase()))
        } else {
          this.getVeiculos(1, this.per_page)
        }
      })
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Veiculos = this.Veiculos.filter(veiculos =>
        veiculos.placa.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
      } else {
        this.getVeiculos(1, this.per_page)
      }
    }
}
