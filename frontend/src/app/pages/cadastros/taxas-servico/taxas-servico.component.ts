import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taxas-servico',
  standalone: true,
  imports: [CommonModule, SubMenuComponent],
  templateUrl: './taxas-servico.component.html',
  styleUrl: './taxas-servico.component.css'
})
export class TaxasServicoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'TAXAS DE SERVIÇOS'
  }
}
