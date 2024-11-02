import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';
import { Cochera } from '../interfaces/cochera';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientosService {

  constructor() { }

  auth = inject(AuthService)

  cargar():Promise<Estacionamiento[]>{
    return fetch("http://localhost:4201/estacionamientos",{
      method: "GET",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? "")
      },
    }).then(res => res.json());
  }


  buscarActivo(cocheraId:number){
    return this.cargar().then(estacionamientos => {
      let buscado = null;
      for(let estacionamiento of estacionamientos){
        if(estacionamiento.idCochera === cocheraId && estacionamiento.horaEgreso===null){     //hora de egreso = null porque quiere decir que todavia hay un auto ahí
          buscado = estacionamiento;
          break;
        }
      }
      return buscado;
    })
  }

  abrir(patente:string, idCochera:number){
    return fetch("http://localhost:4201/estacionamientos/abrir", {
      method: "POST",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? ""),
        "Content-Type": "application/json"
      },
      body:JSON.stringify({
        patente: patente,
        idCochera: idCochera,
        idUsuarioIngreso: "admin"
      })
    }).then(res => res.json());
  }

  cerrar(patente:string){
    return fetch("http://localhost:4201/estacionamientos/cerrar", {
      method: "PATCH",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? ""),
        "Content-Type": "application/json"
      },
      body:JSON.stringify({
        patente: patente,
        idUsuarioEgreso: "admin"
      })
    }).then(res => res.json());
  }

  obtener(idCochera:number): Promise<Estacionamiento>{
    return fetch(`http://localhost:4201/estacionamientos/${idCochera}`, {
      method: "GET",
    }).then(res => res.json());
  }

}
