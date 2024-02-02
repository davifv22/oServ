import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pre-orcamento',
  standalone: true,
  imports: [CommonModule, SubMenuComponent],
  templateUrl: './pre-orcamento.component.html',
  styleUrl: './pre-orcamento.component.css'
})
export class PreOrcamentoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'PRÉ-ORÇAMENTO'
  }
}
