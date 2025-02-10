import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Funcionarios } from '../../models/funcionarios'

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {
  private apiUrl = '';
  private Funcionarios:Funcionarios

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Funcionarios = {
      idFuncionario:0,
      idUser:0,
      nome:'',
      idEquipe:0,
      situacao:false,
    }
   }

   getFuncionarios(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/funcionarios`, { params });
  }

  postFuncionario(json: any, id: number): Observable<Funcionarios> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/funcionarios`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/funcionario/${id}`, json, { params });
    }
  }
}
