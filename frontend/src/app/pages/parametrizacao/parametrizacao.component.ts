import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { EmpresaComponent } from "./empresa/empresa.component";
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
@Component({
    selector: 'app-parametrizacao',
    standalone: true,
    templateUrl: './parametrizacao.component.html',
    styleUrl: './parametrizacao.component.css',
    imports: [SubMenuComponent, CommonModule, EmpresaComponent, MatTabsModule, MatCardModule]
})
export class ParametrizacaoComponent implements OnInit {
  title:string = ''

  constructor() { }

  ngOnInit(): void {
    this.title = 'PARAMETRIZAÇÃO'
  }
}
