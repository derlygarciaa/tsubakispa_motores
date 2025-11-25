import { AccesoService } from './../../services/acceso.service';
import { NotificationService } from './../../services/notification.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { login } from '../../interfaces/login';
import { CommonModule } from '@angular/common';

//componente de login
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private accesoService = inject(AccesoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);  
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  public isLoading = false;
  public showPassword = false;

  // Formulario de login con validaciones
  public formLogin: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    // Verificar si hay mensajes de sesión expirada
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired']) {
        this.notificationService.showWarning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      if (params['message']) {
        this.notificationService.showInfo(params['message']);
      }
    });

    // Si ya está autenticado, redirigir
    if (this.accesoService.isAuthenticated()) {
      this.router.navigate(['/inicio']);
    }
  }

  //funcion para manejar el inicio de sesion del usuario
  iniciarSesion(): void {
    //validar formulario
    if (this.formLogin.invalid) {
      this.marcarCamposComoTocados();
      this.notificationService.showWarning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    const credenciales: login = {
      email: this.formLogin.value.email.trim(),
      password: this.formLogin.value.password
    };

    this.accesoService.login(credenciales).subscribe({
      next: (response: any) => {
        
        if (response?.token) {
          // Guardar token en sessionStorage (se borra al cerrar el navegador)
          sessionStorage.setItem('token', response.token);
          
          // Mostrar notificación de éxito
          this.notificationService.showSuccess('¡Bienvenido a Tsubaki Spa!');
          
          // Redirigir a inicio
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 500);
        } else {
          this.notificationService.showError('Error en la respuesta del servidor. Por favor, intenta nuevamente.');
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;

        // Manejar diferentes tipos de errores
        if (error.statusCode === 401) {
          this.notificationService.showError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
        } else if (error.statusCode === 422) {
          this.notificationService.showError('Datos inválidos. Por favor, verifica la información ingresada.');
        } else if (error.statusCode === 0) {
          this.notificationService.showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          this.notificationService.showError(error.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  //funcion para navegar a la pagina de registro
  registrarse(): void {
    this.router.navigate(['/registro']);
  }

  //funcion para alternar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  //funcion para marcar todos los campos del formulario como tocados para mostrar errores
  private marcarCamposComoTocados(): void {
    Object.keys(this.formLogin.controls).forEach(key => {
      this.formLogin.get(key)?.markAsTouched();
    });
  }

  //funcion para verificar si un campo especifico tiene errores y ha sido tocado
  hasError(fieldName: string): boolean {
    const field = this.formLogin.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  //funcion para obtener el mensaje de error para un campo especifico
  getErrorMessage(fieldName: string): string {
    const field = this.formLogin.get(fieldName);
    
    if (field?.hasError('required')) {
      return `El campo ${fieldName === 'email' ? 'email' : 'contraseña'} es requerido.`;
    }
    
    if (field?.hasError('email')) {
      return 'Por favor, ingresa un email válido.';
    }
    
    if (field?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    
    return '';
  }
}