import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { usuario } from '../../interfaces/usuario';
import { CommonModule } from '@angular/common';

//componente de registro de usuarios
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  private accesoService = inject(AccesoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  public isLoading = false;
  public showPassword = false;

  // Formulario de registro con validaciones
  public formRegistro: FormGroup = this.formBuilder.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  //funcion para manejar el registro de un nuevo usuario
  registrarse(): void {
    //validar formulario
    if (this.formRegistro.invalid) {
      this.marcarCamposComoTocados();
      this.notificationService.showWarning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    const nuevoUsuario: usuario = {
      nombres: this.formRegistro.value.nombres.trim(),
      apellidos: this.formRegistro.value.apellidos.trim(),
      telefono: parseInt(this.formRegistro.value.telefono),
      email: this.formRegistro.value.email.trim().toLowerCase(),
      password: this.formRegistro.value.password
    };

    this.accesoService.registrarse(nuevoUsuario).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.isSuccess || response.success) {
          this.notificationService.showSuccess('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
          
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        } else {
          this.notificationService.showError('No se pudo completar el registro. Por favor, intenta nuevamente.');
        }
      },
      error: (error: any) => {
        this.isLoading = false;

        //manejar diferentes tipos de errores
        if (error.statusCode === 422) {
          //error de validacion
          if (error.errors) {
            const errores = error.errors;
            if (errores.email) {
              this.notificationService.showError('El email ya está registrado. Por favor, usa otro email.');
            } else {
              this.notificationService.showError('Por favor, verifica los datos ingresados.');
            }
          } else {
            this.notificationService.showError('Error de validación. Por favor, verifica todos los campos.');
          }
        } else if (error.statusCode === 0) {
          this.notificationService.showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          this.notificationService.showError(error.message || 'Error al registrar usuario. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  //funcion para navegar a la pagina de login
  iniciarSesion(): void {
    this.router.navigate(['/']);
  }

  //funcion para alternar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  //funcion para marcar todos los campos del formulario como tocados para mostrar errores
  private marcarCamposComoTocados(): void {
    Object.keys(this.formRegistro.controls).forEach(key => {
      this.formRegistro.get(key)?.markAsTouched();
    });
  }

  //funcion para verificar si un campo especifica tiene errores y ha sido tocado
  hasError(fieldName: string): boolean {
    const field = this.formRegistro.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  //funcion para obtener el mensaje de error para un campo especifico
  getErrorMessage(fieldName: string): string {
    const field = this.formRegistro.get(fieldName);
    
    if (!field) return '';

    if (field.hasError('required')) {
      const nombres: { [key: string]: string } = {
        'nombres': 'nombres',
        'apellidos': 'apellidos',
        'telefono': 'teléfono',
        'email': 'email',
        'password': 'contraseña'
      };
      return `El campo ${nombres[fieldName]} es requerido.`;
    }

    if (field.hasError('email')) {
      return 'Por favor, ingresa un email válido.';
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres.`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `No debe exceder ${maxLength} caracteres.`;
    }

    if (field.hasError('pattern')) {
      if (fieldName === 'telefono') {
        return 'El teléfono debe tener exactamente 10 dígitos.';
      }
    }

    return '';
  }
}