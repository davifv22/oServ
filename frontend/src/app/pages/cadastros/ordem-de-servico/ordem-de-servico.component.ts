import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-ordem-de-servico',
  standalone: true,
  imports: [CommonModule, SubMenuComponent],
  templateUrl: './ordem-de-servico.component.html',
  styleUrl: './ordem-de-servico.component.css'
})
export class OrdemDeServicoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'ORDEM DE SERVIÇO'
  }
}
