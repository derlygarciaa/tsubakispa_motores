import { ReservaService } from './../../services/reserva.service';
import { NotificationService } from './../../services/notification.service';
import { AccesoService } from './../../services/acceso.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditarReservaModalComponent } from './editar-reserva-modal/editar-reserva-modal.component';

//componente para listar todas las reservas (admin)
@Component({
  selector: 'app-lista-reservas',
  standalone: true,
  imports: [RouterLink, CommonModule, EditarReservaModalComponent],
  templateUrl: './lista-reservas.component.html',
  styleUrl: './lista-reservas.component.css'
})
export class ListaReservasComponent implements OnInit {

  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private notificationService = inject(NotificationService);
  private accesoService = inject(AccesoService);

  public listaReservas: any[] = [];
  public listaReservasFiltradas: any[] = [];
  public isLoading = false;
  public filtroEstado: string = 'todas';
  public busqueda: string = '';
  
  // Variables para el modal de edición
  public modalEditarAbierto: boolean = false;
  public reservaSeleccionada: any = null;

  ngOnInit(): void {
    this.cargarReservas();
  }

  //funcion para cargar la lista de reservas desde el backend
  cargarReservas(): void {
    this.isLoading = true;

    this.reservaService.listaReservas().subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success && response.data) {
          this.listaReservas = response.data;
          this.listaReservasFiltradas = response.data;
          
          if (this.listaReservas.length === 0) {
            this.notificationService.showInfo('No hay reservas registradas aún.');
          }
        } else {
          this.listaReservas = [];
          this.listaReservasFiltradas = [];
          this.notificationService.showInfo('No se encontraron reservas.');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.listaReservas = [];
        this.listaReservasFiltradas = [];

        if (error.statusCode === 403) {
          this.notificationService.showError('No tienes permisos para ver esta información.');
          this.router.navigate(['/inicio']);
        } else if (error.statusCode === 0) {
          this.notificationService.showError('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          this.notificationService.showError('Error al cargar las reservas. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  //funcion para filtrar las reservas por estado
  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  //funcion para buscar reservas por nombre del usuario
  buscarReserva(event: any): void {
    this.busqueda = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  //funcion para aplicar los filtros de estado y busqueda
  private aplicarFiltros(): void {
    let reservasFiltradas = this.listaReservas;

    //filtrar por estado
    if (this.filtroEstado !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(
        reserva => reserva.estado === this.filtroEstado
      );
    }

    // Filtrar por búsqueda
    if (this.busqueda) {
      reservasFiltradas = reservasFiltradas.filter(reserva => {
        const nombreCompleto = `${reserva.usuario?.nombres || ''} ${reserva.usuario?.apellidos || ''}`.toLowerCase();
        return nombreCompleto.includes(this.busqueda) || 
               reserva.usuario?.email?.toLowerCase().includes(this.busqueda);
      });
    }

    this.listaReservasFiltradas = reservasFiltradas;
  }

  //funcion para cambiar el estado de una reserva
  cambiarEstado(reservaId: number, nuevoEstado: string): void {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      return;
    }

    this.reservaService.actualizarReservaParcial(reservaId, { estado: nuevoEstado }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess(`Estado actualizado a "${nuevoEstado}".`);
          this.cargarReservas();
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar estado:', error);
        this.notificationService.showError('Error al actualizar el estado.');
      }
    });
  }

  //funcion para eliminar una reserva
  eliminarReserva(reservaId: number, nombreUsuario: string): void {
    const confirmacion = confirm(
      `¿Estás seguro de eliminar la reserva de ${nombreUsuario}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    this.reservaService.eliminarReserva(reservaId).subscribe({
      next: (response: any) => {

        if (response.success) {
          this.notificationService.showSuccess('Reserva eliminada exitosamente.');
          this.cargarReservas();
        }
      },
      error: (error: any) => {
        
        if (error.statusCode === 404) {
          this.notificationService.showError('La reserva no existe o ya fue eliminada.');
          this.cargarReservas();
        } else {
          this.notificationService.showError('Error al eliminar la reserva. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  //funcion para obtener la clase css segun el estado de la reserva
  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'confirmada': 'estado-confirmada',
      'cancelada': 'estado-cancelada'
    };
    return clases[estado] || '';
  }

  //funcion para formatear la fecha para mostrar 
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Bogota'
    });
  }

  //funcion para abrir el modal de edición
  abrirModalEditar(reserva: any): void {
    this.reservaSeleccionada = { ...reserva }; 
    this.modalEditarAbierto = true;
  }

  //funcion para cerrar el modal de edición
  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.reservaSeleccionada = null;
  }

  //funcion para manejar el guardado de cambios del modal
  onGuardarReserva(reservaActualizada: any): void {
    // Actualizar la lista local con los datos actualizados
    const index = this.listaReservas.findIndex(r => r.id === reservaActualizada.id);
    if (index !== -1) {
      this.listaReservas[index] = reservaActualizada;
    }
    
    // Aplicar filtros nuevamente
    this.aplicarFiltros();
    
    // Cerrar el modal
    this.cerrarModalEditar();
  }

  //funcion para navegar de regreso a la pagina de inicio
  volver(): void {
    this.router.navigate(['/inicio']);
  }
}
