import { Injectable, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { FCM } from '@ionic-native/fcm/ngx';

import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string;
  msgSub: Subscription;
  tokSub: Subscription;

  constructor(
    private fcm: FCM,
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    private afMessaging: AngularFireMessaging,
    private alertService: AlertService,
    private uidService: UidService,
  ) {  }

  requestToken() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const region = this.uidService.getRegion();
      if (this.token) {
        this.escuchaMensajes();
        return resolve();
      }
      this.fcm.getToken()
      .then((token) => {
        this.db.object(`repartidores_asociados_data/${region}/${uid}/token`).set(token);
        this.escuchaMensajes();
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error)
      })
    });
  }

  escuchaMensajes() {
    // this.msgSub = this.afMessaging.messages.subscribe((msg: any) => {
    //   this.alertService.presentToast(msg.notification.body);
    // });
    if (this.msgSub) this.msgSub.unsubscribe()
    this.msgSub = this.fcm.onNotification().subscribe((msg: any) => {
        this.ngZone.run(() => {
          if (msg.body === 'Nuevo servicio disponible') {
            // this.audio.play('alerta')
          }
          else {
            this.alertService.presentToast(msg.body)
            // this.silenciar()
          }
        })
    });
  }

  unsubscribeMensajes() {
    if (this.msgSub) { this.msgSub.unsubscribe(); }
    if (this.tokSub) { this.tokSub.unsubscribe(); }
  }

}
