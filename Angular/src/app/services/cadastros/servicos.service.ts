import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicos } from '../../models/servicos'

@Injectable({
  providedIn: 'root'
})
export class ServicosService {
  private apiUrl = '';
  private Servicos:Servicos

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Servicos = {
      idServico:0,
      descricao:'',
      tipo:0,
      valor:'',
      situacao:false,
    }
   }

   getServicos(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/servicos`, { params });
  }

  postServico(json: any, id: number): Observable<Servicos> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/servicos`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/servico/${id}`, json, { params });
    }
  }
}
