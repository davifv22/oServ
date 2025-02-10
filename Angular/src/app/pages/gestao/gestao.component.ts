import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestao',
  standalone: true,
  imports: [SubMenuComponent, CommonModule],
  templateUrl: './gestao.component.html',
  styleUrl: './gestao.component.css'
})
export class GestaoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'GESTÃO OSERV'
  }
}
