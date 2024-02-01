import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.css'
})
export class SubMenuComponent implements OnInit {
  @Input()
  titlePage:string = ''
  @Input()
  input_insert:boolean = false
  @Input()
  input_listing:boolean = false
  @Input()
  contentPage:string = ''

  constructor() { }

  ngOnInit(): void { }

}
