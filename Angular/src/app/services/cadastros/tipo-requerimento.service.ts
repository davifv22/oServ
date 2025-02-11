import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoRequerimento } from '../../models/tipo-requerimento'

@Injectable({
  providedIn: 'root'
})
export class TipoRequerimentoService {
  private apiUrl = '';
  private TipoRequerimento:TipoRequerimento

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.TipoRequerimento = {
      idTipoRequerimento:0,
      descricao:'',
      emiteOrcamento:false,
      emiteOS:false,
      situacao:false,
    }
   }

   getTipoRequerimento(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/tipo_requerimentos`, { params });
  }

  postTipoRequerimento(json: any, id: number): Observable<TipoRequerimento> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/tipo_requerimentos`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/tipo_requerimento/${id}`, json, { params });
    }
  }
}
