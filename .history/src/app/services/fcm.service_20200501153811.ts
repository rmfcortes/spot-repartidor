import { Injectable, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { FCM } from '@ionic-native/fcm/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string;
  notifcationSub: Subscription;


  constructor(
    private fcm: FCM,
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) {  }

  requestToken() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const region = this.uidService.getRegion()
      if (this.token) {
        this.escuchaMensajes()
        return resolve()
      }
      this.fcm.getToken()
      .then(token => {
        this.db.object(`repartidores_asociados_data/${region}/${uid}/token`).set(token)
        return token
      })
      .then(token => this.db.object(`repartidores_tokens/${uid}/token`).set(token))
      .then(() => {
        this.escuchaMensajes()
        resolve()
      })
      .catch((error) => {
        console.error(error);
        reject(error)
      })
    });
  }

  escuchaMensajes() {
    console.log('Escucha mensajes')
    this.notifcationSub = this.fcm.onNotification().subscribe((msg: any) => {
      this.ngZone.run(() => {
        this.fcm.clearAllNotifications()
        console.log(msg)
      })
    })
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
