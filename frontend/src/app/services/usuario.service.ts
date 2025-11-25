import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appsettings } from '../settings/appsettings';

//servicio para gestionar usuarios
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
  private baseUrl = `${appsettings.apiUrl}/usuarios`;

  //obtener todos los usuarios
  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  //obtener un usuario especifico
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}

