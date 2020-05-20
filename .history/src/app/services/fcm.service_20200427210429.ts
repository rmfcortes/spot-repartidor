import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

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
    private db: AngularFireDatabase,
    private afMessaging: AngularFireMessaging,
    private alertService: AlertService,
    private uidService: UidService,
  ) {  }

  requestToken() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const region = this.uidService.getRegion();
      if (this.tokSub && this.token) {
        this.escuchaMensajes();
        return resolve();
      }
      this.tokSub = this.afMessaging.requestToken
        .subscribe(
          (token) => {
            this.db.object(`repartidores_asociados_data/${region}/${uid}/token`).set(token);
            this.escuchaMensajes();
            resolve();
          },
          (error) => {
            console.error(error);
            reject(error)
          }
        );
    });
  }

  escuchaMensajes() {
    this.msgSub = this.afMessaging.messages.subscribe((msg: any) => {
      this.alertService.presentToast(msg.notification.body);
    });
  }

  unsubscribeMensajes() {
    if (this.msgSub) { this.msgSub.unsubscribe(); }
    if (this.tokSub) { this.tokSub.unsubscribe(); }
  }

}
