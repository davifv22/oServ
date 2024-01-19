import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Head, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Header } from '../models/header'

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = '';
  private header:Header | any

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
   }

   getHeader(): Observable<Header> {
    this.header = this
    .http
    .get<Header>
    (`${this.apiUrl}`)


    return this.header
   }
}
