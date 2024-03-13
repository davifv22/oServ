import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, SubMenuComponent],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'SERVIÇOS'
  }
}
