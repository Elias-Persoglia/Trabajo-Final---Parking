import { Injectable } from '@angular/core';
import { Login } from '../interfaces/login';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  login(datosLogin:Login){
    return fetch("http://localhost:4201/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(datosLogin),
    })
    .then(res => { 
      //es una función por bloques, no tiene el return implícito y hay que escribirlo
      return res.json().then(resJson =>{
      if(resJson.status === "ok"){
        //Login correcto
        localStorage.setItem("token", resJson.token);
        return true;
      }else{
        return false;
      }
    })
  })
  }

  getToken():string | null {
    return localStorage.getItem("token") ?? "";
  }

  estaLogueado():boolean {
    if (this.getToken()){
      return true;
    }else{
      return false;
    }
  }

  logOut(){
    localStorage.removeItem("token");
  }

}
