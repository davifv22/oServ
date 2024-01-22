import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login } from '../models/login'

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = '';

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
   }


   validarLogin(login: Login): Observable<Login> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.apiUrl}login`, login, { headers });
   }
}
