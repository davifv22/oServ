import { Component, OnInit } from '@angular/core';
import { FormLoginComponent } from './components/form-login/form-login.component'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {


  constructor() { }

  ngOnInit(): void { }
}
