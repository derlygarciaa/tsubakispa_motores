import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { responseacceso } from '../interfaces/responseacceso';
import { usuario } from '../interfaces/usuario';
import { login } from '../interfaces/login';
import { logout } from '../interfaces/logout';
import { responseregistro } from '../interfaces/responseregistro';

//servicio para la gestion de acceso y autenticacion de usuarios
@Injectable({
  providedIn: 'root'
})
export class AccesoService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.apiUrl;

  constructor() { }

  //funcion para registrar un nuevo usuario en el sistema
  registrarse(objeto: usuario): Observable<responseregistro> {
    return this.http.post<responseregistro>(`${this.baseUrl}/register`, objeto);
  }

  //funcion para iniciar sesion de un usuario
  login(objeto: login): Observable<responseacceso> {
    return this.http.post<responseacceso>(`${this.baseUrl}/login`, objeto);
  }

  //funcion para obtener los datos del usuario autenticado
  getUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`);
  }

  //funcion para renovar el token JWT actual
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/refresh`, {});
  }

  //funcion para cerrar la sesion del usuario e invalidar el token
  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {});
  }

  //funcion para verificar si el usuario esta autenticado
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  //funcion para obtener el usuario almacenado en sessionStorage
  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  //funcion para verificar si el usuario actual es administrador
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.rol_id === 1;
  }

  //funcion para limpiar los datos de sesion del sessionStorage
  clearSession(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
}