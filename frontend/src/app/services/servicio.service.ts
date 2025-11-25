import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../settings/appsettings';

//servicio para gestionar los servicios del spa
@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private http = inject(HttpClient);
  private baseUrl = `${appsettings.apiUrl}/servicios`;

  //define el metodo para obtener todos los servicios activos
  obtenerServicios(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  //define el metodo para obtener servicios por categoria
  obtenerPorCategoria(categoria: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categoria/${categoria}`);
  }

  //define el metodo para obtener un servicio especifico
  obtenerServicio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}

