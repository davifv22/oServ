import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  @Input()
  nomeEmpresa: string

  constructor() {
    this.nomeEmpresa = ''
  }

  ngOnInit(): void {
    this.nomeEmpresa = 'Maikim Ar-condicionados LTDA'
  }


}
