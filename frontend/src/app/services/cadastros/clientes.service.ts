import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clientes } from '../../models/clientes'

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = '';
  private Clientes:Clientes

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Clientes = {
      idCliente:0,
      nome:'',
      telefone:'',
      email:'',
      doc:'',
      endereco:'',
      cidade:'',
      cep:'',
      situacao:false,
      observacao:'',
      dtCadastro:''
    }
   }

   getClientes(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/clientes`, { params });
  }

  postClientes(json: any, id: number): Observable<Clientes> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/clientes`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/cliente/${id}`, json, { params });
    }
  }
}
