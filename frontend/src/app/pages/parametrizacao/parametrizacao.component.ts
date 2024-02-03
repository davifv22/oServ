import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametrizacao',
  standalone: true,
  imports: [SubMenuComponent, CommonModule],
  templateUrl: './parametrizacao.component.html',
  styleUrl: './parametrizacao.component.css'
})
export class ParametrizacaoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'PARAMETRIZAÇÃO'
  }
}
