import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PreOrcamento } from '../../models/pre-orcamento'

@Injectable({
  providedIn: 'root'
})
export class PreOrcamentoService {
  private apiUrl = '';
  private PreOrcamento:PreOrcamento

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.PreOrcamento = {
      idTipoRequerimento:0,
      idServico:0,
      valor:''
    }
   }

   getPreOrcamento(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/pre_orcamentos`, { params });
  }

  postPreOrcamento(json: any, id: number): Observable<PreOrcamento> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/pre_orcamentos`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/pre_orcamento/${id}`, json, { params });
    }
  }
}
