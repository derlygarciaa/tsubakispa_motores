import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { responseacceso } from '../interfaces/responseacceso';
import { usuario } from '../interfaces/usuario';
import { login } from '../interfaces/login';
import { logout } from '../interfaces/logout';
import { responseregistro } from '../interfaces/responseregistro';

@Injectable({
  providedIn: 'root'
})
export class AccesoService {

  private http = inject(HttpClient)
  private baseUrl:string = appsettings.apiUrl;

  constructor() { }

  registrarse(objeto:usuario): Observable<responseregistro>{
    return this.http.post<responseregistro>(`${this.baseUrl}/register`,objeto)
  }

  login(objeto:login): Observable<responseacceso>{
    return this.http.post<responseacceso>(`${this.baseUrl}/login`,objeto)
  }

  getUser(): Observable<usuario> {
    return this.http.get<usuario>(`${this.baseUrl}/me`);
  }

  logout(): Observable<logout> {
    return this.http.post<logout>(`${this.baseUrl}/logout`, {});
  }
}