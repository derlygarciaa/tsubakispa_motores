import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ReservaService } from '../../../services/reserva.service';
import { ServicioService } from '../../../services/servicio.service';
import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-editar-reserva-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './editar-reserva-modal.component.html',
  styleUrl: './editar-reserva-modal.component.css'
})
export class EditarReservaModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() reserva: any = null;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private servicioService = inject(ServicioService);
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);

  public isLoading: boolean = false;
  public isLoadingServicios: boolean = false;
  public isLoadingUsuarios: boolean = false;
  public servicios: any[] = [];
  public usuarios: any[] = [];
  public horariosDisponibles: string[] = [];
  public minDate: string = '';

  public formEditar: FormGroup = this.formBuilder.group({
    usuario_id: ['', [Validators.required]],
    servicio_id: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora_inicio: ['', [Validators.required]],
    hora_final: ['', [Validators.required]],
    telefono_contacto: ['', [Validators.pattern(/^\d{7,15}$/)]],
    numero_personas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    observaciones: ['', [Validators.maxLength(500)]],
    precio: [{ value: '', disabled: true }],
    estado: ['pendiente', [Validators.required]]
  });

  public estadosDisponibles = [
    { valor: 'pendiente', label: 'Pendiente', color: '#F59E0B' },
    { valor: 'confirmada', label: 'Confirmada', color: '#10B981' },
    { valor: 'cancelada', label: 'Cancelada', color: '#EF4444' }
  ];

  ngOnInit(): void {
    // Establecer fecha mínima (hoy)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Generar horarios disponibles
    this.generarHorariosDisponibles();

    // Cargar servicios y usuarios
    this.cargarServicios();
    this.cargarUsuarios();

    // Escuchar cambios en el servicio para actualizar precio
    this.formEditar.get('servicio_id')?.valueChanges.subscribe(servicioId => {
      this.onServicioChange(servicioId);
    });

    // Escuchar cambios en hora_inicio para sugerir hora_final
    this.formEditar.get('hora_inicio')?.valueChanges.subscribe(horaInicio => {
      if (horaInicio) {
        const servicioSeleccionado = this.servicios.find(s => s.id === this.formEditar.get('servicio_id')?.value);
        const duracion = servicioSeleccionado?.duracion_minutos || 60;
        const horaFinalSugerida = this.calcularHoraFinal(horaInicio, duracion);
        this.formEditar.patchValue({ hora_final: horaFinalSugerida }, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reserva'] && this.reserva && this.isOpen) {
      this.cargarDatosReserva();
    }
  }

  private cargarDatosReserva(): void {
    if (!this.reserva) return;

    this.formEditar.patchValue({
      usuario_id: this.reserva.usuario_id,
      servicio_id: this.reserva.servicio_id,
      fecha: this.reserva.fecha,
      hora_inicio: this.reserva.hora_inicio,
      hora_final: this.reserva.hora_final,
      telefono_contacto: this.reserva.telefono_contacto,
      numero_personas: this.reserva.numero_personas || 1,
      observaciones: this.reserva.observaciones,
      precio: this.reserva.precio,
      estado: this.reserva.estado
    });
  }

  private cargarServicios(): void {
    this.isLoadingServicios = true;
    
    this.servicioService.obtenerServicios().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.servicios = response.data;
        }
        this.isLoadingServicios = false;
      },
      error: (error: any) => {
        console.error('Error al cargar servicios:', error);
        this.notificationService.showError('Error al cargar los servicios');
        this.isLoadingServicios = false;
      }
    });
  }

  private cargarUsuarios(): void {
    this.isLoadingUsuarios = true;
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.usuarios = response.data;
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

  private onServicioChange(servicioId: number): void {
    const servicio = this.servicios.find(s => s.id === Number(servicioId));
    
    if (servicio) {
      this.formEditar.patchValue({ 
        precio: servicio.precio 
      });

      // Recalcular hora final si hay hora de inicio
      const horaInicio = this.formEditar.get('hora_inicio')?.value;
      if (horaInicio) {
        const horaFinalSugerida = this.calcularHoraFinal(horaInicio, servicio.duracion_minutos);
        this.formEditar.patchValue({ hora_final: horaFinalSugerida }, { emitEvent: false });
      }
    }
  }

  private calcularHoraFinal(horaInicio: string, duracionMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  }

  public guardarCambios(): void {
    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      this.notificationService.showWarning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    const reservaData = {
      ...this.formEditar.getRawValue()
    };

    this.reservaService.actualizarReserva(this.reserva.id, reservaData).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          this.notificationService.showSuccess('¡Reserva actualizada exitosamente!');
          this.onSave.emit(response.data);
          this.cerrarModal();
        } else {
          this.notificationService.showError('No se pudo actualizar la reserva.');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        
        if (error.statusCode === 409) {
          this.notificationService.showError('Ya existe una reserva en ese horario.');
        } else if (error.statusCode === 422) {
          this.notificationService.showError(error.message || 'Error de validación.');
        } else {
          this.notificationService.showError(error.message || 'Error al actualizar la reserva.');
        }
      }
    });
  }

  public cerrarModal(): void {
    this.formEditar.reset();
    this.onClose.emit();
  }

  public hasError(field: string): boolean {
    const control = this.formEditar.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public getErrorMessage(field: string): string {
    const control = this.formEditar.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido (7-15 dígitos)';
    }
    if (control?.hasError('min')) {
      return 'Mínimo 1 persona';
    }
    if (control?.hasError('max')) {
      return 'Máximo 10 personas';
    }
    if (control?.hasError('maxlength')) {
      return 'Máximo 500 caracteres';
    }
    
    return '';
  }

  public formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}

