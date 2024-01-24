import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import { HeaderComponent } from './components/header/header.component';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [CommonModule, RouterLink, MenuComponent, HeaderComponent]
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {}


  constructor( ) { }

}
