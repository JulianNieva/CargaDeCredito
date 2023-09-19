import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder,Validators,FormGroup,FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email :FormControl
  clave :FormControl
  usuario:number = -1
  nombreUsuario:string = "Ninguno"
  loginPressed:boolean = false

  usuariosHardcode = [
    {email: 'admin@admin.com', password:'111111'},
    {email: 'usuario@usuario.com', password:'333333'},
    {email: 'invitado@invitado.com', password:'222222'}
  ]

  constructor(private userService:UserService,private router:Router) 
  { 
    this.email = new FormControl('',[
      Validators.required,
      Validators.email
    ])
    this.clave = new FormControl('',[
      Validators.required,
      Validators.minLength(6)
    ])
  }

  ngOnInit() {}

  get isFormValid(): boolean {
    return this.email.valid && this.clave.valid;
  }

  login()
  {
    this.loginPressed = true;
    this.userService.login(this.email.value?.toString(),this.clave.value?.toString())
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/home'])
        this.LimpiarForm()
        this.usuario = -1
      },2000)
    }).catch(error => {
      setTimeout(() => {
        this.userService.MostrarToast("ERROR!",this.userService.obtenerError(error),"danger","remove-circle-outline")
      },2000)
    })
  }

  CargarForm(){

    if(this.usuario != -1)
    {
      switch (this.usuario) {
        case 0:
          this.nombreUsuario = "Admin"
          break;
        case 1:
          this.nombreUsuario = "Usuario"
          break;
        default:
          this.nombreUsuario = "Invitado"
          break;
      }
      this.email.patchValue(this.usuariosHardcode[this.usuario].email)
      this.clave.patchValue(this.usuariosHardcode[this.usuario].password)
    }
    else
    {
      this.LimpiarForm()
    }
  }

  LimpiarForm()
  {
    this.email.reset()
    this.clave.reset()
    this.loginPressed = false;
  }

}
