import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CrearReservaComponent } from './pages/crear-reserva/crear-reserva.component';
import { ListaReservasComponent } from './pages/lista-reservas/lista-reservas.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

//rutas de la aplicacion con proteccion de seguridad
export const routes: Routes = [
  //rutas publicas - sin autenticacion
  {
    path: '',
    component: LoginComponent,
    title: 'Iniciar Sesión | Tsubaki Spa'
  },
  {
    path: 'registro',
    component: RegistroComponent,
    title: 'Registro | Tsubaki Spa'
  },

  //rutas autenticadas - requieren login
  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard],
    title: 'Inicio | Tsubaki Spa'
  },
  {
    path: 'reserva',
    component: CrearReservaComponent,
    canActivate: [authGuard],
    title: 'Crear Reserva | Tsubaki Spa'
  },

  //rutas de administrador - requieren rol admin
  {
    path: 'lista',
    component: ListaReservasComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Lista de Reservas | Tsubaki Spa'
  },

  //ruta wildcard - redirige al login
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];