import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [SubMenuComponent, CommonModule],
  templateUrl: './financeiro.component.html',
  styleUrl: './financeiro.component.css'
})
export class FinanceiroComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'FINCANEIRO OSERV'
  }
}
