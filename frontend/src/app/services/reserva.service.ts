import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { reserva } from '../interfaces/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private http = inject(HttpClient)
  private baseUrl:string = appsettings.apiUrl;

  constructor() { }

  lista_reserva(): Observable<reserva[]>{
    return this.http.get<reserva[]>(`${this.baseUrl}/reservas`)
  }

  lista_reserva_id(id:number): Observable<reserva[]>{
    return this.http.get<reserva[]>(`${this.baseUrl}/reservas/${id}`)
  }

  crear_reserva(objeto: reserva): Observable<reserva>{
    return this.http.post<reserva>(`${this.baseUrl}/reservas`, objeto);
  }

  actualizar_reserva(id: number, objeto: reserva): Observable<reserva>{
    return this.http.put<reserva>(`${this.baseUrl}/reservas/${id}`, objeto);
  }

  //ese partial<> hace que ts pase la reserva.ts que es datos obligatorios a datos opcionales
  actualizar_reserva_parcial(id: number, datos: Partial<reserva>): Observable<reserva>{
    return this.http.patch<reserva>(`${this.baseUrl}/reservas/${id}`, datos);
  }

  eliminar_reserva(id: number): Observable<reserva>{
    return this.http.delete<reserva>(`${this.baseUrl}/reservas/${id}`);
  }
}