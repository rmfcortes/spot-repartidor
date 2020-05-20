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

  checkUser(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let user;
      user = this.uidService.getUid()
      if (user) return resolve(true)
      user = await this.getUser()
      if (user) return resolve(true)
      user = await this.revisaFireAuth()
      if (user) return resolve(true)
      return resolve(false);
    });
  }

  async getUser(): Promise<boolean> {
    return new Promise (async (resolve, reject) => {
      const uid = await this.getVariableFromStorage('uid')
      if (uid) {
        const nombre = await this.getVariableFromStorage('nombre')
        this.uidService.setUid(uid);
        this.uidService.setNombre(nombre);
        resolve(true)
      } else resolve(false)
    });
  }
  async revisaFireAuth(): Promise<boolean> {
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
          resolve(true);
        } else {
          resolve(false)
        }
      }, err => {
        console.log(err)
        resolve(false)
      });
    });
  }

  getRegion(): Promise<boolean> {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            const region = await this.storage.get('region');
            if (region) {
              this.uidService.setRegion(region);
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
          this.uidService.setUid(uid);
          this.uidService.setNombre(nombre);
          resolve(true);
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

  // Whether is asociado or not

  esAsociado() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const asocSub = this.db.object(`repartidores_asociados/${uid}`).valueChanges().subscribe(async (resp) => {
        asocSub.unsubscribe()
        console.log(resp);
        try {          
          if (resp) {
            this.uidService.setAsociado(true)
            const region = resp
            const ubicacion: Geoposition = await this.ubicacionService.getPositionProm()
            const coords = {
              lat: ubicacion.coords.latitude,
              lng: ubicacion.coords.longitude
            }
            await this.db.object(`repartidores_asociados_data/${region}/${uid}`).update(coords)
            resolve()
          } else {
            this.uidService.setAsociado(false)
            // await this.db.object(`repartidores_asociados_data/${region}/${uid}`).remove()
            resolve()
          }
        } catch (error) {
          console.log(error);
          reject(error)
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
          this.storage.remove('region');
        } else {
          localStorage.removeItem('uid');
          localStorage.removeItem('nombre');
          localStorage.removeItem('region');
        }
        this.uidService.setUid(null);
        this.uidService.setNombre(null);
        this.uidService.setRegion(null);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Auxiliar

  getVariableFromStorage(variable: string): Promise<string> {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          const value = this.storage.get(variable);
          resolve(value)
        });
      } else {
        // Escritorio
        const value = localStorage.getItem(variable)
        resolve(value)
      }
    });
  }

}
