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
  uid: string;
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
      this.uid = this.uidService.getUid();
      if (!this.uid) {
        return resolve();
      }
      if (this.tokSub && this.token) {
        this.escuchaMensajes();
        return resolve();
      }
      this.tokSub = this.afMessaging.requestToken
        .subscribe(
          (token) => {
            this.db.object(`usuarios/${this.uid}/token`).set(token);
            this.escuchaMensajes();
            resolve();
          },
          (error) => {
            console.error(error);
          }
        );
    });
  }

  escuchaMensajes() {
    if (this.msgSub) {
      return;
    }
    this.msgSub = this.afMessaging.messages.subscribe((msg: any) => {
      this.alertService.presentToast(msg.notification.body);
    });
  }

  unsubscribeMensajes() {
    if (this.msgSub) { this.msgSub.unsubscribe(); }
    if (this.tokSub) { this.tokSub.unsubscribe(); }
  }

}
