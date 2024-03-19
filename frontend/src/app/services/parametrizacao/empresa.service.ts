import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa } from '../../models/empresa'


@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = '';
  private Empresa:Empresa

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Empresa = {
      idEmpresa:0,
      nomeEmpresa:'',
      dtRefSistema:'',
      dtImplantacao:'',
      endereco:'',
      cidade:'',
      cnpj:''
    }
   }

  getEmpresa(): Observable<Empresa> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    return this.http.get<any>(`${this.apiUrl}/empresa`, { params });
  }
}
