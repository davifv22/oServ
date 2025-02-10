import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-sub-menu',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.css'
})
export class SubMenuComponent {
  @Input()
  titlePage:string = ''

  constructor() {  }
}
