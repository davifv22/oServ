import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, MatMenuModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {


  constructor( ) {
   }

   ngOnInit(): void {
   }
}


