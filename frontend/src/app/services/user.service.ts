import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '';
  private User:User

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.User = {
      id:0,
      nome:'',
      user:'',
      email:'',
      situacao:'',
      is_admin:false,
      api_key:''
    }
   }

   getUser(): Observable<User> {
    let api_key = sessionStorage.getItem('api_key');
    let id = sessionStorage.getItem('id');

    const params = { api_key: `${api_key}` };
    return this.http.get<any>(`${this.apiUrl}/usuario/${id}`, { params });
  }

  getUsers(page: number, per_page: number): Observable<any> {
    let api_key = sessionStorage.getItem('api_key');

    const params = { api_key: `${api_key}`, page: page, per_page: per_page};
    return this.http.get<any>(`${this.apiUrl}/usuarios`, { params });
  }
}

