import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cochera';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CocherasService } from '../../services/cocheras.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import { EstacionamientosService } from '../../services/estacionamientos.service';

@Component({
  selector: 'app-estado-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './estado-cocheras.component.html',
  styleUrl: './estado-cocheras.component.scss'
})

export class EstadoCocherasComponent {
  esAdmin:boolean = true;

  auth = inject(AuthService);
  cocheras = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);

  filas:(Cochera & {activo:Estacionamiento|null})[]=[];

  ngOnInit(){
    this.reloadCocheras();
  }

  reloadCocheras(){
    return this.cocheras.cargar().then(cocheras => {
      this.filas =[];

      for(let cochera of cocheras){
        this.estacionamientos.buscarActivo(cochera.id).then(estacionamiento => {
          this.filas.push({
            ...cochera,
            activo: estacionamiento,
          });
        })
      }
    });
  }

  ordenarCocheras(){
    this.filas.sort((a,b) => a.id > b.id ? 1 : -1)    
  }

 
  agregarCochera(){
      this.cocheras.agregar().then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras())
  }


  habilitarCochera(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(!cochera?.deshabilitada){
      Swal.fire({
        icon: "warning",
        title: "ERROR",
        text: `La cochera ${cocheraId} ya se encuentra habilitada`,
      })
    }else{
      this.cocheras.habilitar(cochera).then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras());
    }
  }

  /**Cambia la disponibilidad de la cochera, si está habilitada la deshabilita */
  deshabilitarCochera(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(cochera.activo){
      Swal.fire({
        icon: "error",
        title: "Cochera ocupada",
        text: `Para deshabilitar la cochera ${cocheraId}, primero debe cerrarse`,
      })
    } else if(cochera?.deshabilitada){
      Swal.fire({
        icon: "warning",
        title: "ERROR",
        text: `La cochera ${cocheraId} ya se encuentra deshabilitada`,
      })
    }else{
      this.cocheras.deshabilitar(cochera).then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras());
    }
  }

  abrirModalEliminarGarage(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    if(!cochera.activo){
      Swal.fire({
        title: `Desea eliminar la cochera ${cocheraId}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar cochera",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed){
          this.cocheras.eliminar(cochera).then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras());
        }
      });
    } else{
      Swal.fire({
        icon: "error",
        title: "Cochera ocupada",
        text: `Para eliminar la cochera ${cocheraId}, primero deberá cerrarse`,
      })
    }
  }

  /**Abre un nuevo estacionamiento = rgistra la patente de un auto */
  abrirModalNuevoParking(cocheraId: number){
    Swal.fire({
      title: "Ingrese el número de la patente",
      input: "text",
      inputLabel: "Patente...",
      inputValue:"",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator:(value) => {
        if(!value){
          return "Ingrese una patente válida.";
        }
        return
      }
    }).then((result) => {
      if(result.isConfirmed){
        this.estacionamientos.abrir(result.value, cocheraId).then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras());
      }
    });
  }

  abrirModalCerrarParking(cocheraId:number){
    Swal.fire({
      title: `Desea cerrar el estacionamiento en la cochera ${cocheraId}?`,
      text: "Cuando se haya cerrado se cobrará automaticamente",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Cerrar estacionamiento"
    }).then((result) => {
      if (result.isConfirmed) {
        this.abrirModalCobroParking(cocheraId);
      }
    });
  }

  abrirModalCobroParking(cocheraId:number){
    const cochera = this.filas.find(cochera => cochera.id === cocheraId)!;
    this.estacionamientos.cerrar(cochera.activo?.patente!).then((res) => {
      return Swal.fire({
        title: "Cobro cochera",
        text: `El monto a cobrar por el tiempo estacionado en la cochera ${cocheraId} es $${res.costo}`,
        icon: "info",
        confirmButtonText: "Cobrar"
      }).then((result) => {
        if (result.isConfirmed) {
          const Toast = Swal.mixin({
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          })
        }
      }).then(() => this.reloadCocheras()).then(()=> this.ordenarCocheras());
    })
  }
  
}
