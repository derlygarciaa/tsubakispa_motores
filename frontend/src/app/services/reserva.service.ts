import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';
import { reserva } from '../interfaces/reserva';

//servicio para la gestion de reservas
@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.apiUrl;

  constructor() { }

  //funcion para obtener la lista completa de reservas (solo admin)
  listaReservas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas/`);
  }

  //funcion para obtener las reservas del usuario autenticado
  misReservas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas/mis-reservas`);
  }

  //funcion para obtener una reserva especifica por id
  obtenerReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas/${id}`);
  }

  //funcion para crear una nueva reserva
  crearReserva(datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas/`, datos);
  }

  //funcion para actualizar una reserva completamente
  actualizarReserva(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/reservas/${id}`, datos);
  }

  //funcion para actualizar una reserva parcialmente
  actualizarReservaParcial(id: number, datos: Partial<any>): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/reservas/${id}`, datos);
  }

  //funcion para eliminar una reserva
  eliminarReserva(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/reservas/${id}`);
  }

  //funcion para validar si una fecha es valida para reservas
  validarFecha(fecha: string): boolean {
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaReserva >= hoy;
  }

  //funcion para validar si un horario esta dentro del horario de operacion
  validarHorario(horaInicio: string, horaFinal: string): boolean {
    const inicio = this.convertirHoraAMinutos(horaInicio);
    const final = this.convertirHoraAMinutos(horaFinal);
    const apertura = this.convertirHoraAMinutos('09:00');
    const cierre = this.convertirHoraAMinutos('20:00');

    return inicio >= apertura && final <= cierre && inicio < final;
  }

  //funcion para convertir una hora en formato HH:mm a minutos desde medianoche
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }
}