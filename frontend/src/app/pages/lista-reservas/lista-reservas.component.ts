import { ReservaService } from './../../services/reserva.service';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { reserva } from '../../interfaces/reserva';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-reservas',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './lista-reservas.component.html',
  styleUrl: './lista-reservas.component.css'
})
export class ListaReservasComponent {

  private router = inject(Router);  

  private ReservaService = inject(ReservaService);
  public listaReserva:reserva[] = [];

  constructor(){
    this.ReservaService.lista_reserva().subscribe({
      next:(data)=>{
        if(data.length > 0){
          this.listaReserva = data
        }
      },
      error:(error)=>{
        console.log(error.message);
      }
    })
  } 
}
