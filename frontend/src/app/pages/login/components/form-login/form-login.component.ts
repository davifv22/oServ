import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent implements OnInit {
  @Input()
  usuario:string =""
  @Input() // mudar os input para o login principal
  senha:string =""

  logar(f: NgForm) { // fazer essa logica de login buscando no backend
    console.log('logou')
    console.log(f.value)
    console.log(this.usuario)
    console.log(this.senha)
  }

  ngOnInit(): void { }

}
