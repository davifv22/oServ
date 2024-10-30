import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Setor } from '../../models/setor'

@Injectable({
  providedIn: 'root'
})
export class SetorService {
  private apiUrl = '';
  private Setor:Setor

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Setor = {
      idSetor:0,
      descricao:'',
      situacao:false
    }
   }

   getSetores(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/setor`, { params });
  }

  postSetor(json: any, id: number): Observable<Setor> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    console.log(json)
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/setor`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/setor/${id}`, json, { params });
    }
  }
}
