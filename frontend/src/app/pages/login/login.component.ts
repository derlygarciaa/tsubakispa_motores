import { AccesoService } from './../../services/acceso.service';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { login } from '../../interfaces/login';
import { error } from 'console';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private AccesoService = inject(AccesoService);
  private router = inject(Router);  
  public formBuild = inject(FormBuilder);

  //formulario de login para recibir las credenciales del usuario
  public formLogin:FormGroup = this.formBuild.group({
    email:['', Validators.required, Validators.email],
    password:['',Validators.required]
  })

  //metodo para iniciar seccion
  iniciarSesion(){
    if (this.formLogin.invalid) return; //verifica que el formulario de login sea valido, si no es asi lo devuelve
    
    const objeto:login = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password,
    }

    this.AccesoService.login(objeto).subscribe({ //para hacer una peticion http, por el metodo login de accesoservice dandole los datos al objeto
      next:(data)=>{ //en data estara la respuesta luego de la peticion http, es decir, el token
        console.log('Respuesta del backend:', data);
        if (data?.token) {
          localStorage.setItem("token",data.token) //si el login estuvo bien se guarda el token en el navegador para q permanezca la seccion activa
          this.router.navigate(['inicio']) //lo pasa a la pagina de inicio
        }else{
          alert("Las credenciales no coincide con nuestros registros")
        }
      },
      error:(error)=>{
        console.log(error.message);
        alert("Las credenciales no coincide con nuestros registros")
      }
    })
  }

  registrarse(){
    this.router.navigate(['registro']) //pasa a la pagina de registro si se quiere crear una cuenta
  }
}