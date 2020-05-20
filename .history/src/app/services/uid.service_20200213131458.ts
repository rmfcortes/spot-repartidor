import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  uid: string;
  nombre: string;

  public usuario = new BehaviorSubject(null);

  constructor() {  }

  setUid(uid) {
    this.uid = uid;
    this.usuario.next(uid);
  }

  getUid() {
    return this.uid;
  }

  setNombre(nombre) {
    this.nombre = nombre;
  }

  getNombre() {
    return this.nombre;
  }

}
