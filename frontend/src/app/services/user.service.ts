import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuarios } from '../models/usuarios'
import { HttpClient, HttpHeaders  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '';
  private User:Usuarios

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.User = {
      idUser:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      isAdmin:false,
      apiKey:''
    }
   }

   getUser(): Observable<Usuarios> {
    let apiKey = sessionStorage.getItem('apiKey');
    let idUser = sessionStorage.getItem('idUser');

    const params = { apiKey: `${apiKey}` };
    return this.http.get<any>(`${this.apiUrl}/usuario/${idUser}`, { params });
  }

  postUser(json: any): Observable<Usuarios> {
    let apiKey = sessionStorage.getItem('apiKey');
    let idUser = sessionStorage.getItem('idUser');

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { apiKey: `${apiKey}` };

    return this.http.post<any>(`${this.apiUrl}/usuario/${idUser}`, json, { headers, params })
  }

  getUsers(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/usuarios`, { params });
  }
}

