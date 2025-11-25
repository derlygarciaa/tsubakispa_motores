import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

//interface para las notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

//servicio para manejar notificaciones toast en toda la aplicacion
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor() { }

  //funcion para mostrar una notificacion de exito
  showSuccess(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      message,
      duration
    });
  }

  //funcion para mostrar una notificacion de error
  showError(message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      message,
      duration
    });
  }

  //funcion para mostrar una notificacion de advertencia
  showWarning(message: string, duration: number = 4000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      message,
      duration
    });
  }

  //funcion para mostrar una notificacion informativa
  showInfo(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      message,
      duration
    });
  }

  //funcion para agregar una notificacion al array de notificaciones
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    //auto-remover la notificacion despues del tiempo especificado
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  //funcion para remover una notificacion especifica
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  //funcion para limpiar todas las notificaciones
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  //funcion para generar un id unico para cada notificacion
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

