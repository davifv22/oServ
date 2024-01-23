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
    const json = JSON.parse(`${sessionStorage.getItem('usuario')}`);

    const params = { api_key: json.api_key };
    return this.http.get<any>(`${this.apiUrl}/usuario/${json.id}`, { params });
  }
}

