import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Login } from '../models/login'
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  private apiUrl = '';

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
  }

  login(login: Login): Observable<Login> {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.isAuthenticatedSubject.next(true);
    return this.http.post<any>(`${this.apiUrl}/login`, login, { headers })
  }

  isAuthenticated(): boolean {
    const isAuthenticated = sessionStorage.getItem('is_logged_in')
    if (isAuthenticated) {
      return true;
    } else {
      return false;
    }
  }

  logout(): boolean {
    sessionStorage.clear()
    this.isAuthenticatedSubject.next(false);
    return true
  }
}
