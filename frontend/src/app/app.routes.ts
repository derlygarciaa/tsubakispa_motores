import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CrearReservaComponent } from './pages/crear-reserva/crear-reserva.component';
import { ListaReservasComponent } from './pages/lista-reservas/lista-reservas.component';

export const routes: Routes = [ //es para definir las redirecciones entre las paginas (componentes) y especificar una ruta exacta
  {path:"", component:LoginComponent}, //si la url esta vacia que salga la pagina de login
  {path:"registro", component:RegistroComponent}, //si aparece la url de registro salga esa
  {path:"inicio", component:InicioComponent}, // si la url es del index que salga el inicio de la pagina luego de tener acceso
  {path:"reserva", component:CrearReservaComponent}, //pagina para crear una reserva
  {path:"lista", component:ListaReservasComponent}, //pagina para crear una reserva
];