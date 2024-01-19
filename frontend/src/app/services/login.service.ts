import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Head, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login } from '../models/login'

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = '';
  private login:Login | any

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
   }

   getLogin(): Observable<Login> {
    this.login = this
    .http
    .get<Login>
    (`${this.apiUrl}`)


    return this.login
   }
}
