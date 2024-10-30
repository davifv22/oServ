import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Veiculos } from '../../models/veiculos'

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private apiUrl = '';
  private Veiculos:Veiculos

  constructor(private http: HttpClient) {
    this.apiUrl  = environment.url
    this.Veiculos = {
      idVeiculo:0,
      modelo:'',
      marca:'',
      placa:'',
      kmRodados:'',
      idEquipe:0,
      situacao:false,
    }
   }

   getVeiculos(page: number, per_page: number, isPaginate: boolean): Observable<any> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}`, page: page, per_page: per_page, isPaginate: isPaginate};
    return this.http.get<any>(`${this.apiUrl}/veiculos`, { params });
  }

  postVeiculo(json: any, id: number): Observable<Veiculos> {
    let apiKey = sessionStorage.getItem('apiKey');

    const params = { apiKey: `${apiKey}` };
    if (id == 0) {
      return this.http.post<any>(`${this.apiUrl}/veiculos`, json, { params });
    } else {
      return this.http.post<any>(`${this.apiUrl}/veiculo/${id}`, json, { params });
    }
  }
}
