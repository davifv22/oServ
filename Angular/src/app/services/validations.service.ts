import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidationsService {
  private apiUrl = ''

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
  }

  validations_db(): Observable<Boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}/usuario/db`, { headers });
  }

  init_db(json: any): Observable<Boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/usuario/db`, json, { headers });
  }

}
