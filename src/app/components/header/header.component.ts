import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  esAdmin:boolean = true;

  /**Ejemplo de SweetAlert con input */
  resultadoInput: string = "";

  abrirModal(){
    Swal.fire({
      title: "Enter your IP address",
      input: "text",
      inputLabel: "Your IP address",
      inputValue:"",
      showCancelButton: true,
    }).then((result) =>{
      this.resultadoInput=result.value
    });
  }

  logOut(){
    this.auth.logOut();
    this.router.navigate(["/login"]);
  }

}
