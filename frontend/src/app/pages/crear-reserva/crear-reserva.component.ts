import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [],
  templateUrl: './crear-reserva.component.html',
  styleUrl: './crear-reserva.component.css'
})
export class CrearReservaComponent {

  private router = inject(Router);  
  
  volver(){
    this.router.navigate(['inicio']) //pasa a la pagina de registro si se quiere crear una cuenta
  }
}
