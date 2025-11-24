import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { usuario } from '../../interfaces/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  private AccesoService = inject(AccesoService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);
  
  //formulario de registro para recibir las credenciales del usuario
  public formRegistro:FormGroup = this.formBuild.group({
    nombres:['', Validators.required],
    apellidos:['', Validators.required],
    telefono:['', Validators.required],
    email:['', Validators.required, Validators.email],
    password:['',Validators.required],    
  })

  //metodo para registrar un usuario
  registrarse(){
    if (this.formRegistro.invalid) return; //verifica que el formulario de registro sea valido, si no es asi lo devuelve
    
    const objeto:usuario = {
      nombres: this.formRegistro.value.nombres,
      apellidos: this.formRegistro.value.apellidos,
      telefono: this.formRegistro.value.telefono,
      email: this.formRegistro.value.email,
      password: this.formRegistro.value.password, 
    }

    this.AccesoService.registrarse(objeto).subscribe({ //para hacer una peticion http, por el metodo usuario de accesoservice dandole los datos al objeto
      next:(data)=>{ //en data estara la respuesta luego de la peticion http
        if (data.isSuccess){
          this.router.navigate(['']) //pasa a la pagina de login
        }else{
          alert("No se pudo registrar")
        }
      },error:(error)=>{
        console.log(error.message);
        alert("El email ya esta en uso")
      }
    })
  }  

  iniciarSesion(){
    this.router.navigate(['']) //pasa a la pagina de login
  }
}