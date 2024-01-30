import { Component, OnInit } from '@angular/core';
import { HomeComponent } from '../../home/home.component';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.css'
})
export class FuncionariosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

}
