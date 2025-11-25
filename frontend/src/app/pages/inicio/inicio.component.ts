import { Router, RouterLink } from '@angular/router';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AccesoService } from '../../services/acceso.service';
import { NotificationService } from '../../services/notification.service';
import { ReservaService } from '../../services/reserva.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

//componente de pagina de inicio
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule, FullCalendarModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  private router = inject(Router);
  private accesoService = inject(AccesoService);
  private notificationService = inject(NotificationService);
  private reservaService = inject(ReservaService);
  private platformId = inject(PLATFORM_ID);

  public currentUser: any = null;
  public isAdmin: boolean = false;
  public isLoadingReservas: boolean = false;
  public isBrowser: boolean = false;

  //opciones de configuracion del calendario FullCalendar
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    timeZone: 'America/Bogota',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events: [],
    slotMinTime: '09:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    slotDuration: '00:30:00',
    height: 'auto',
    contentHeight: 650,
    expandRows: true
  };

  ngOnInit(): void {
    // Verificar si estamos en el navegador 
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.cargarDatosUsuario();
    
    // Cargar reservas solo en el navegador
    if (this.isBrowser) {
      this.cargarReservasParaCalendario();
    }
  }

  //metodo publico para refrescar las reservas del calendario
  public refrescarReservas(): void {
    if (this.isBrowser) {
      this.notificationService.showInfo('Actualizando calendario...');
      this.cargarReservasParaCalendario();
    }
  }

  //funcion para cargar los datos del usuario autenticado
  private cargarDatosUsuario(): void {
    this.currentUser = this.accesoService.getCurrentUser();
    this.isAdmin = this.accesoService.isAdmin();

    if (!this.currentUser) {
      // Si no hay datos en sessionStorage, obtener del backend
      this.accesoService.getUser().subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            this.isAdmin = response.data.rol_id === 1;
            sessionStorage.setItem('user', JSON.stringify(response.data));
          }
        },
        error: (error: any) => {
          console.error('Error al cargar datos del usuario:', error);
          this.notificationService.showError('Error al cargar tu información.');
        }
      });
    }
  }

  //funcion para cargar reservas y mostrarlas en el calendario
  private cargarReservasParaCalendario(): void {
    this.isLoadingReservas = true;

    // Determinar qué endpoint usar según el rol
    const reservasObservable = this.isAdmin 
      ? this.reservaService.listaReservas()
      : this.reservaService.misReservas();

    reservasObservable.subscribe({
      next: (response: any) => {
        this.isLoadingReservas = false;
        
        if (response.success && response.data) {
          const reservas = response.data;
          
          // Convertir reservas a eventos del calendario
          const eventos = reservas.map((reserva: any) => {
            // Determinar color según estado
            let backgroundColor = '';
            let borderColor = '';
            let textColor = '#ffffff';

            switch(reserva.estado) {
              case 'confirmada':
                backgroundColor = '#10B981'; // Verde
                borderColor = '#059669';
                break;
              case 'pendiente':
                backgroundColor = '#F59E0B'; // Naranja/Amarillo
                borderColor = '#D97706';
                break;
              case 'cancelada':
                backgroundColor = '#EF4444'; // Rojo
                borderColor = '#DC2626';
                break;
              default:
                backgroundColor = '#0C4284';
                borderColor = '#0A376E';
            }

            // Crear título descriptivo con el servicio
            let titulo = '';
            if (this.isAdmin) {
              titulo = `${reserva.usuario?.nombres || 'Usuario'} - ${reserva.servicio?.nombre || 'Servicio'}`;
            } else {
              titulo = reserva.servicio?.nombre || 'Mi Reserva';
            }

            const evento = {
              id: reserva.id.toString(),
              title: titulo,
              start: `${reserva.fecha}T${reserva.hora_inicio}`,
              end: `${reserva.fecha}T${reserva.hora_final}`,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              textColor: textColor,
              extendedProps: {
                estado: reserva.estado,
                usuario: reserva.usuario,
                servicio: reserva.servicio,
                reservaCompleta: reserva
              }
            };

            return evento;
          });

          // Actualizar eventos del calendario
          this.calendarOptions.events = eventos;
          
          if (eventos.length > 0) {
            this.notificationService.showSuccess(`${eventos.length} reserva(s) cargada(s) correctamente`);
          } else {
            this.notificationService.showInfo('No hay reservas para mostrar');
          }
        } else {
          this.notificationService.showWarning('No se pudieron cargar las reservas');
        }
      },
      error: (error: any) => {
        this.isLoadingReservas = false;
        console.error('Error al cargar reservas para el calendario:', error);
        this.notificationService.showError('Error al cargar las reservas en el calendario');
      }
    });
  }

  //handler para cuando se selecciona una fecha en el calendario
  handleDateSelect(selectInfo: DateSelectArg): void {
    // Navegar a crear reserva con la fecha seleccionada
    this.router.navigate(['/reserva'], {
      queryParams: {
        fecha: selectInfo.startStr.split('T')[0]
      }
    });
  }

  //handler para cuando se hace click en un evento del calendario
  handleEventClick(clickInfo: EventClickArg): void {
    const reserva = clickInfo.event.extendedProps['reservaCompleta'];
    const usuario = clickInfo.event.extendedProps['usuario'];
    
    let mensaje = `
       Fecha: ${this.formatearFecha(reserva.fecha)}
       Horario: ${reserva.hora_inicio} - ${reserva.hora_final}
       Estado: ${reserva.estado}
    `;

    if (this.isAdmin && usuario) {
      mensaje = `
         Cliente: ${usuario.nombres} ${usuario.apellidos}
         Email: ${usuario.email}
         Teléfono: ${usuario.telefono}
      ` + mensaje;
    }

    if (confirm(`Detalles de la Reserva:\n${mensaje}\n\n¿Deseas ver más detalles?`)) {
      if (this.isAdmin) {
        // Admin puede ver lista completa
        this.router.navigate(['/lista']);
      }
    }
  }

  //funcion callback para eventos del calendario
  handleEvents(events: any[]): void {

  }

  //funcion para navegar a la pagina de crear reserva
  crearReserva(): void {
    this.router.navigate(['/reserva']);
  }

  //funcion para recargar el calendario
  recargarCalendario(): void {
    this.cargarReservasParaCalendario();
  }

  //funcion para navegar a la pagina de lista de reservas (admin)
  verTodasLasReservas(): void {
    this.router.navigate(['/lista']);
  }

  //funcion para cerrar la sesion del usuario
  cerrarSesion(): void {
    const confirmacion = confirm('¿Estás seguro de cerrar sesión?');
    
    if (!confirmacion) {
      return;
    }

    this.accesoService.logout().subscribe({
      next: (response: any) => {
        
        // Limpiar datos locales
        this.accesoService.clearSession();
        
        this.notificationService.showSuccess('Sesión cerrada exitosamente. ¡Hasta pronto!');
        
        // Redirigir al login
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error: any) => {
        
        // Aún así limpiar la sesión local
        this.accesoService.clearSession();
        this.notificationService.showInfo('Sesión cerrada localmente.');
        this.router.navigate(['/']);
      }
    });
  }

  //funcion para obtener la clase css segun el estado de la reserva
  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'badge-pendiente',
      'confirmada': 'badge-confirmada',
      'cancelada': 'badge-cancelada'
    };
    return clases[estado] || '';
  }

  //funcion para formatear la fecha para mostrar
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'America/Bogota'
    });
  }
}