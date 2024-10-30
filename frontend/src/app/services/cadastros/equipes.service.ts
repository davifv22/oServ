import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipes } from '../../models/equipes'

@Injectable({
  providedIn: 'root'
})
export class EquipesService {
  private apiUrl = '';
  private Equipes:Equipes

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Equipes = {
      idEquipe:0,
      descricao:'',
      idSetor:0,
      situacao:false,
    }
   }

   getEquipes(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/equipes`, { params });
  }

  postEquipe(json: any, id: number): Observable<Equipes> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/equipes`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/equipe/${id}`, json, { params });
    }
  }
}
