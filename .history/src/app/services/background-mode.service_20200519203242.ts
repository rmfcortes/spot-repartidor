import { Injectable, NgZone } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { UbicacionService } from './ubicacion.service';
import { FcmService } from './fcm.service';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {

  backSubscription: Subscription
  frontSubscription: Subscription

  isAsocidado = false

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    public backgroundMode: BackgroundMode,
    private ubicacionService: UbicacionService,
    private uidService: UidService,
    private fcmService: FcmService,
  ) { }

  setAsociado(value: boolean) {
    this.isAsocidado = value
  }

  async initBackgroundMode() {
    this.platform.ready().then(() => {
      this.backgroundMode.setDefaults({silent: true});
      this.setBackMode()
      this.setFrontMode()
      this.backgroundMode.enable()
      // this.backgroundMode.excludeFromTaskList();
    });
  }

  setBackMode() {
    if (this.backSubscription) { this.backSubscription.unsubscribe(); }
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        this.backgroundMode.disableWebViewOptimizations()
        if (this.isAsocidado) this.listenNotificationsOnBackground()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
      });
    });
  }

  listenNotificationsOnBackground() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.on('child_added', snap => {
      this.backgroundService.unlock()
      const notification = snap.val()
      this.newNotification(notification)
    })
  }

  setFrontMode() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    this.frontSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      this.ngZone.run(() => {
        if (this.isAsocidado) this.fcmService.escuchaMensajes()
        if (this.isAsocidado) this.fcmService.stopListenNotificationsBack()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
      })
    });
  }

  unlock() {
    this.backgroundMode.unlock()
  }

  deshabilitaBackground() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    if (this.backSubscription) this.backSubscription.unsubscribe()
    this.backgroundMode.disable()
  }


}
