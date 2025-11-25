import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../services/reserva.service';
import { ServicioService } from '../../services/servicio.service';
import { UsuarioService } from '../../services/usuario.service';
import { AccesoService } from '../../services/acceso.service';
import { NotificationService } from '../../services/notification.service';

//componente para crear nuevas reservas
@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-reserva.component.html',
  styleUrl: './crear-reserva.component.css'
})
export class CrearReservaComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private servicioService = inject(ServicioService);
  private usuarioService = inject(UsuarioService);
  private accesoService = inject(AccesoService);
  private notificationService = inject(NotificationService);

  public isLoading = false;
  public isLoadingServicios = false;
  public isLoadingUsuarios = false;
  public minDate: string = '';
  public currentUser: any = null;
  public isAdmin: boolean = false;
  public servicios: any[] = [];
  public usuarios: any[] = [];
  public servicioSeleccionado: any = null;

  //horarios disponibles
  public horariosDisponibles: string[] = [];

  // Categorías de servicios
  public categorias = [
    { valor: '', label: 'Todas las categorías' },
    { valor: 'masajes', label: 'Masajes' },
    { valor: 'faciales', label: 'Faciales' },
    { valor: 'corporales', label: 'Corporales' },
    { valor: 'manicure', label: 'Manicure' },
    { valor: 'pedicure', label: 'Pedicure' },
    { valor: 'depilacion', label: 'Depilación' },
    { valor: 'otros', label: 'Otros' }
  ];

  // Formulario de reserva 
  public formReserva: FormGroup = this.formBuilder.group({
    usuario_id: ['', []],  // Solo visible para admins
    servicio_id: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora_inicio: ['', [Validators.required]],
    hora_final: ['', [Validators.required]],
    telefono_contacto: ['', [Validators.pattern(/^\d{7,15}$/)]],
    numero_personas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    observaciones: ['', [Validators.maxLength(500)]],
    precio: [{ value: '', disabled: true }],
    estado: ['pendiente']
  });

  ngOnInit(): void {
    // Establecer fecha mínima (hoy)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Leer fecha desde queryParams si viene del calendario
    this.route.queryParams.subscribe(params => {
      if (params['fecha']) {
        this.formReserva.patchValue({
          fecha: params['fecha']
        });
      }
    });

    // Obtener usuario actual
    this.currentUser = this.accesoService.getCurrentUser();
    
    if (!this.currentUser) {
      this.notificationService.showError('No se pudo obtener la información del usuario.');
      this.router.navigate(['/inicio']);
      return;
    }

    // Verificar si es admin
    this.isAdmin = this.currentUser.rol_id === 1;

    // Configurar validaciones según el rol
    if (this.isAdmin) {
      // Admin debe seleccionar un usuario
      this.formReserva.get('usuario_id')?.setValidators([Validators.required]);
      this.cargarUsuarios();
    } else {
      // Usuario normal: la reserva es para sí mismo y siempre pendiente
      this.formReserva.patchValue({
        usuario_id: this.currentUser.id
      });
      // Deshabilitar cambio de estado para usuarios normales
      this.formReserva.get('estado')?.disable();
    }

    if (this.currentUser.telefono) {
      this.formReserva.patchValue({
        telefono_contacto: this.currentUser.telefono
      });
    }

    // Generar horarios disponibles
    this.generarHorariosDisponibles();

    // Cargar servicios
    this.cargarServicios();

    // Agregar validadores personalizados
    this.agregarValidadoresPersonalizados();

    this.formReserva.get('servicio_id')?.valueChanges.subscribe(servicioId => {
      this.onServicioChange(servicioId);
    });
  }

  private cargarServicios(): void {
    this.isLoadingServicios = true;
    
    this.servicioService.obtenerServicios().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.servicios = response.data;
        } else {
          this.notificationService.showError('Error al cargar los servicios');
        }
        this.isLoadingServicios = false;
      },
      error: (error: any) => {
        console.error('Error al cargar servicios:', error);
        this.notificationService.showError('Error al cargar los servicios disponibles');
        this.isLoadingServicios = false;
      }
    });
  }

  //cargar todos los usuarios (solo para admin)
  private cargarUsuarios(): void {
    this.isLoadingUsuarios = true;
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.usuarios = response.data;
        } else {
          this.notificationService.showError('Error al cargar los usuarios');
        }
        this.isLoadingUsuarios = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.showError('Error al cargar los usuarios');
        this.isLoadingUsuarios = false;
      }
    });
  }

   //manejar cambio en el servicio seleccionado
  private onServicioChange(servicioId: number): void {
    if (!servicioId) {
      this.servicioSeleccionado = null;
      this.formReserva.patchValue({ precio: '' });
      return;
    }

    // Buscar el servicio seleccionado
    this.servicioSeleccionado = this.servicios.find(s => s.id === Number(servicioId));
    
    if (this.servicioSeleccionado) {
      // Actualizar precio automáticamente
      this.formReserva.patchValue({ 
        precio: this.servicioSeleccionado.precio 
      });

      // Recalcular hora final basada en duración del servicio (si hay hora de inicio)
      const horaInicio = this.formReserva.get('hora_inicio')?.value;
      if (horaInicio) {
        const horaFinalSugerida = this.calcularHoraFinal(horaInicio, this.servicioSeleccionado.duracion_minutos);
        this.formReserva.patchValue({ hora_final: horaFinalSugerida }, { emitEvent: false });
      }
    }
  }

  //calcular hora final basada en hora inicio y duracion
  private calcularHoraFinal(horaInicio: string, duracionMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  }

  //generar horarios disponibles en intervalos de 30 minutos
  private generarHorariosDisponibles(): void {
    const horarios: string[] = [];
    const horaInicio = 9; // 9:00 AM
    const horaFin = 20; // 8:00 PM

    for (let hora = horaInicio; hora <= horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        if (hora === horaFin && minuto > 0) break; 
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        horarios.push(`${horaStr}:${minutoStr}`);
      }
    }

    this.horariosDisponibles = horarios;
  }

  //agregar validadores personalizados al formulario
  private agregarValidadoresPersonalizados(): void {
    // Validador para verificar que la hora final sea después de la hora inicial
    this.formReserva.setValidators(this.validarHorarios);

    // Auto-sugerir hora final cuando cambia la hora de inicio
    this.formReserva.get('hora_inicio')?.valueChanges.subscribe(horaInicio => {
      if (horaInicio) {
        // Usar duración del servicio si está seleccionado, sino usar 60 minutos por defecto
        const duracion = this.servicioSeleccionado?.duracion_minutos || 60;
        const horaFinalSugerida = this.calcularHoraFinal(horaInicio, duracion);
        this.formReserva.patchValue({ hora_final: horaFinalSugerida }, { emitEvent: false });
      }
    });
  }

  //validador personalizado para verificar horarios
  private validarHorarios = (control: any): { [key: string]: boolean } | null => {
    const horaInicio = control.get('hora_inicio')?.value;
    const horaFinal = control.get('hora_final')?.value;

    if (!horaInicio || !horaFinal) {
      return null;
    }

    const inicio = this.convertirHoraAMinutos(horaInicio);
    const final = this.convertirHoraAMinutos(horaFinal);

    if (final <= inicio) {
      return { 'horaInvalida': true };
    }

    // Validar duración mínima (30 minutos)
    const duracion = final - inicio;
    if (duracion < 30) {
      return { 'duracionMinima': true };
    }

    // Validar duración máxima (3 horas)
    if (duracion > 180) {
      return { 'duracionMaxima': true };
    }

    return null;
  };

  //convertir hora en formato HH:mm a minutos desde medianoche
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  //crear nueva reserva
  crearReserva(): void {
    // Validar formulario
    if (this.formReserva.invalid) {
      this.marcarCamposComoTocados();
      
      // Mostrar mensaje de error específico
      if (this.formReserva.errors?.['horaInvalida']) {
        this.notificationService.showWarning('La hora final debe ser posterior a la hora de inicio.');
      } else if (this.formReserva.errors?.['duracionMinima']) {
        this.notificationService.showWarning('La reserva debe tener una duración mínima de 30 minutos.');
      } else if (this.formReserva.errors?.['duracionMaxima']) {
        this.notificationService.showWarning('La reserva no puede exceder las 3 horas.');
      } else {
        this.notificationService.showWarning('Por favor, completa todos los campos correctamente.');
      }
      
      return;
    }

    this.isLoading = true;

    const reservaData: any = {
      servicio_id: this.formReserva.value.servicio_id,
      fecha: this.formReserva.value.fecha,
      hora_inicio: this.formReserva.value.hora_inicio,
      hora_final: this.formReserva.value.hora_final,
      telefono_contacto: this.formReserva.value.telefono_contacto,
      numero_personas: this.formReserva.value.numero_personas,
      observaciones: this.formReserva.value.observaciones,
      precio: this.formReserva.getRawValue().precio
    };

    // Admin: Incluir usuario_id y estado seleccionados
    if (this.isAdmin) {
      reservaData.usuario_id = this.formReserva.value.usuario_id;
      reservaData.estado = this.formReserva.value.estado;
    } else {
      // Usuario normal: Siempre su propio ID y estado pendiente
      reservaData.usuario_id = this.currentUser.id;
      reservaData.estado = 'pendiente';
    }

    this.reservaService.crearReserva(reservaData).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          this.notificationService.showSuccess('¡Reserva creada exitosamente!');
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1500);
        } else {
          this.notificationService.showError('No se pudo crear la reserva. Por favor, intenta nuevamente.');
        }
      },
      error: (error: any) => {
        this.isLoading = false;

        // Manejar diferentes tipos de errores
        if (error.statusCode === 409) {
          this.notificationService.showError('Ya existe una reserva en ese horario. Por favor, selecciona otro horario.');
        } else if (error.statusCode === 422) {
          if (error.message) {
            this.notificationService.showError(error.message);
          } else {
            this.notificationService.showError('Error de validación. Por favor, verifica los datos ingresados.');
          }
        } else if (error.statusCode === 0) {
          this.notificationService.showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          this.notificationService.showError(error.message || 'Error al crear la reserva. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  //navegar de regreso a la pagina de inicio
  volver(): void {
    this.router.navigate(['/inicio']);
  }

  //marcar todos los campos del formulario como tocados
  private marcarCamposComoTocados(): void {
    Object.keys(this.formReserva.controls).forEach(key => {
      this.formReserva.get(key)?.markAsTouched();
    });
  }

  //verificar si un campo tiene errores
  hasError(fieldName: string): boolean {
    const field = this.formReserva.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  //obtener mensaje de error para un campo especifico
  getErrorMessage(fieldName: string): string {
    const field = this.formReserva.get(fieldName);
    
    if (!field) return '';

    if (field.hasError('required')) {
      const nombres: { [key: string]: string } = {
        'usuario_id': 'usuario',
        'servicio_id': 'servicio',
        'fecha': 'fecha',
        'hora_inicio': 'hora de inicio',
        'hora_final': 'hora final',
        'numero_personas': 'número de personas'
      };
      return `El campo ${nombres[fieldName]} es requerido.`;
    }

    if (field.hasError('pattern') && fieldName === 'telefono_contacto') {
      return 'El teléfono debe tener entre 7 y 15 dígitos.';
    }

    if (field.hasError('maxLength') && fieldName === 'observaciones') {
      return 'Las observaciones no pueden exceder 500 caracteres.';
    }

    if (field.hasError('min')) {
      return 'El valor mínimo es 1.';
    }

    if (field.hasError('max')) {
      return 'El valor máximo es 10.';
    }

    return '';
  }

  //calcular la duracion de la reserva en minutos
  calcularDuracion(): number | null {
    const horaInicio = this.formReserva.get('hora_inicio')?.value;
    const horaFinal = this.formReserva.get('hora_final')?.value;

    if (!horaInicio || !horaFinal) {
      return null;
    }

    const inicio = this.convertirHoraAMinutos(horaInicio);
    const final = this.convertirHoraAMinutos(horaFinal);

    return final > inicio ? final - inicio : null;
  }

  //formatear duracion en texto legible
  formatearDuracion(minutos: number | null): string {
    if (!minutos) return '';

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins}min`;
    }
  }

  //formatear precio con separadores de miles
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  //filtrar servicios por categoria
  get serviciosFiltrados(): any[] {
    return this.servicios;
  }
}
