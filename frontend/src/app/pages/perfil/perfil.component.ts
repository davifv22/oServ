import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SubMenuComponent, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'PERFIL'
  }
}
