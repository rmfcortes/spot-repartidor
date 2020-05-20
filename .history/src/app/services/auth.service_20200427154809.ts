import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

import { Geoposition } from '@ionic-native/geolocation/ngx';

import { UbicacionService } from './ubicacion.service';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
    public authFirebase: AngularFireAuth,
    private ubicacionService: UbicacionService,
    private uidService: UidService,
  ) { }

  // Check isLog

  async getUser() {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            const uid = await this.storage.get('uid');
            if (uid) {
              this.uidService.setUid(uid);
              const nombre = await this.storage.get('nombre');
              this.uidService.setNombre(nombre);
              await this.esAsociado()
              resolve(true);
            } else {
              await this.revisaFireAuth();
              resolve(true);
            }
          } catch (error) {
            console.log(error);
            resolve(false);
          }
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('uid') ) {
          const uid = localStorage.getItem('uid');
          const nombre = localStorage.getItem('nombre');
          console.log(uid);
          console.log(nombre);
          this.uidService.setUid(uid);
          this.uidService.setNombre(nombre);
          await this.esAsociado()
          resolve(uid);
        } else {
          try {
            await this.revisaFireAuth();
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        }
      }
    });
  }
  async revisaFireAuth() {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(async (user) => {
        authSub.unsubscribe();
        if (user) {
          const usuario =  {
            nombre: user.displayName,
            foto: user.photoURL,
            uid: user.uid
          };
          await this.setUser(usuario.uid, usuario.nombre);
          await this.esAsociado()
          resolve(true);
        } else {
          reject();
        }
      });
    });
  }

  esAsociado() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const asocSub = this.db.object(`repartidores_asociados/${uid}`).valueChanges().subscribe(async (resp) => {
        asocSub.unsubscribe()
        try {          
          if (resp) {
            this.uidService.setAsociado(true)
            const region = resp
            const ubicacion: Geoposition = await this.ubicacionService.getPositionProm()
            await this.db.object(`repartidores_asociados_data/${uid}/${region}`).update(ubicacion.coords)
            resolve()
          } else {
            this.uidService.setAsociado(false)
            await this.db.object(`repartidores_asociados_data/${uid}`).remove()
            resolve()
          }
        } catch (error) {
          console.log(error);
        }
      })
    });
  }

  // Auth

  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        const resp = await this.authFirebase.auth.signInWithEmailAndPassword(email, pass);
        this.setUser(resp.user.uid, resp.user.displayName);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // SetUser

  setUser(uid, nombre) {
    return new Promise (async (resolve, reject) => {
      if (this.platform.is ('cordova')) {
        this.storage.set('uid', uid);
        this.storage.set('nombre', nombre);
      } else {
        localStorage.setItem('uid', uid);
        localStorage.setItem('nombre', nombre);
        this.uidService.setUid(uid);
        this.uidService.setNombre(nombre);
        resolve();
      }
    });
  }

   // Logout

   async logout() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.signOut();
        if ( this.platform.is('cordova') ) {
          this.storage.remove('uid');
          this.storage.remove('nombre');
        } else {
          localStorage.removeItem('uid');
          localStorage.removeItem('nombre');
        }
        this.uidService.setUid(null);
        this.uidService.setNombre(null);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

}
