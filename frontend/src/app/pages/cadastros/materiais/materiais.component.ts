import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [CommonModule, SubMenuComponent],
  templateUrl: './materiais.component.html',
  styleUrl: './materiais.component.css'
})
export class MateriaisComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'MATERIAIS'
  }
}
