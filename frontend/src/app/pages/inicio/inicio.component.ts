import { Router, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  private router = inject(Router);  
  
  crearReserva(){
    this.router.navigate(['reserva']) //pasa a la pagina de crear reserva
  }
}