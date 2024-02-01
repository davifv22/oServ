import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [CommonModule, RouterLink, SubMenuComponent]
})
export class HomeComponent implements OnInit {
  title:string = ''
  constructor() { }


  ngOnInit(): void {
    this.title = 'HOME'
  }
  }
