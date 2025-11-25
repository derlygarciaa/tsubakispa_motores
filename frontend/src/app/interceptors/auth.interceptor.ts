import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

//interceptor para agregar el token JWT a todas las peticiones HTTP y manejar errores de autenticacion de forma centralizada
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Obtener el token desde sessionStorage (se borra al cerrar el navegador)
  const token = sessionStorage.getItem('token');
  
  // Clonar la petición y agregar el header de autenticación si existe token
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Continuar con la petición y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Error de red o servidor no responde
      if (error.status === 0) {
        console.error('Error de conexión:', error.error);
        return throwError(() => ({
          success: false,
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
          statusCode: 0
        }));
      }

      // 401 - No autorizado (token inválido o expirado)
      if (error.status === 401) {
        console.warn('Token inválido o expirado. Redirigiendo al login...');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        router.navigate(['/'], { 
          queryParams: { 
            sessionExpired: 'true',
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
          } 
        });
        
        return throwError(() => ({
          success: false,
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          statusCode: 401
        }));
      }

      // 403 - Prohibido (sin permisos)
      if (error.status === 403) {
        console.warn('Acceso prohibido:', error.error);
        return throwError(() => ({
          success: false,
          message: 'No tienes permisos para acceder a este recurso.',
          statusCode: 403
        }));
      }

      // 404 - No encontrado
      if (error.status === 404) {
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Recurso no encontrado.',
          statusCode: 404
        }));
      }

      // 409 - Conflicto (por ejemplo, reserva duplicada)
      if (error.status === 409) {
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Conflicto en la operación.',
          statusCode: 409
        }));
      }

      // 422 - Errores de validación
      if (error.status === 422) {
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Error de validación.',
          errors: error.error?.errors,
          statusCode: 422
        }));
      }

      // 500 - Error interno del servidor
      if (error.status === 500) {
        console.error('Error interno del servidor:', error.error);
        return throwError(() => ({
          success: false,
          message: 'Error interno del servidor. Por favor, intenta más tarde.',
          statusCode: 500
        }));
      }

      // Otros errores
      console.error('Error HTTP:', error);
      return throwError(() => ({
        success: false,
        message: error.error?.message || 'Ha ocurrido un error inesperado.',
        statusCode: error.status
      }));
    })
  );
};

