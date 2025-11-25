import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccesoService } from '../services/acceso.service';
import { map, catchError, of } from 'rxjs';

//guard para proteger rutas que requieren autenticacion
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const accesoService = inject(AccesoService);
  
  // Verificar si existe token en sessionStorage (se borra al cerrar navegador)
  const token = sessionStorage.getItem('token');
  
  if (!token) {
    console.warn('No se encontró token. Redirigiendo al login...');
    router.navigate(['/'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Validar token con el backend
  return accesoService.getUser().pipe(
    map((response: any) => {
      if (response.success && response.data) {
        // Guardar datos del usuario en sessionStorage
        sessionStorage.setItem('user', JSON.stringify(response.data));
        console.log('Usuario autenticado:', response.data.email);
        return true;
      } else {
        // Token inválido
        console.warn('Token inválido. Redirigiendo al login...');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        router.navigate(['/'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    }),
    catchError((error) => {
      // Error al validar el token
      console.error('Error al validar token:', error);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      router.navigate(['/'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};

