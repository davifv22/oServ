import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {CdkAccordionModule} from '@angular/cdk/accordion';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, MatMenuModule, MatButtonModule, CdkAccordionModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  constructor( ) {
   }

   ngOnInit(): void {
   }
}


