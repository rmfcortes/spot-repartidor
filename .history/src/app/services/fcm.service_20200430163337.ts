import { Injectable, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { FCM } from '@ionic-native/fcm/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';
import { AlertService } from './alert.service';

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
    private alertService: AlertService,
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
      .then((token) => {
        this.db.object(`repartidores_asociados_data/${region}/${uid}/token`).set(token)
        this.db.object(`repartidores_token/${uid}/token`).set(token)
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
    this.notifcationSub = this.fcm.onNotification().subscribe((msg: any) => {
      this.ngZone.run(() => {
        console.log(msg)
      })
    })
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
