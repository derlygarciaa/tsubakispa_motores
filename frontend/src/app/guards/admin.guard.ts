import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccesoService } from '../services/acceso.service';
import { map, catchError, of } from 'rxjs';

//guard para proteger rutas que requieren rol de administrador
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const accesoService = inject(AccesoService);
  
  // Verificar si existe token en sessionStorage
  const token = sessionStorage.getItem('token');
  
  if (!token) {
    console.warn('No se encontró token. Redirigiendo al login...');
    router.navigate(['/']);
    return false;
  }

  // Verificar primero en sessionStorage si ya tenemos los datos del usuario
  const userStr = sessionStorage.getItem('user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      
      if (user.rol_id === 1) {
        console.log('Acceso de administrador concedido');
        return true;
      } else {
        console.warn('Acceso denegado: Usuario no es administrador');
        router.navigate(['/inicio'], {
          queryParams: { 
            error: 'no-admin',
            message: 'No tienes permisos de administrador para acceder a esta sección.' 
          }
        });
        return false;
      }
    } catch (e) {
      console.error('Error al parsear datos del usuario:', e);
    }
  }

  // Si no hay datos en localStorage, validar con el backend
  return accesoService.getUser().pipe(
    map((response: any) => {
      if (response.success && response.data) {
        // Guardar datos del usuario en sessionStorage
        sessionStorage.setItem('user', JSON.stringify(response.data));
        
        // Verificar si es administrador (rol_id === 1)
        if (response.data.rol_id === 1) {
          console.log('Acceso de administrador concedido');
          return true;
        } else {
          console.warn('Acceso denegado: Usuario no es administrador');
          router.navigate(['/inicio'], {
            queryParams: { 
              error: 'no-admin',
              message: 'No tienes permisos de administrador para acceder a esta sección.' 
            }
          });
          return false;
        }
      } else {
        // Token inválido
        console.warn('Token inválido. Redirigiendo al login...');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        router.navigate(['/']);
        return false;
      }
    }),
    catchError((error) => {
      console.error('Error al validar permisos de administrador:', error);
      router.navigate(['/inicio'], {
        queryParams: { 
          error: 'validation-error',
          message: 'Error al validar permisos. Por favor, intenta nuevamente.' 
        }
      });
      return of(false);
    })
  );
};

