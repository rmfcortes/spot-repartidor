import { Injectable, NgZone } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { UbicacionService } from './ubicacion.service';
import { FcmService } from './fcm.service';

@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {

  backSubscription: Subscription
  frontSubscription: Subscription

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    public backgroundMode: BackgroundMode,
    private ubicacionService: UbicacionService,
    private fcmService: FcmService,
  ) { }

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
        this.fcmService.listenNotificationsOnBackground()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
      });
    });
  }

  setFrontMode() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    this.frontSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      this.ngZone.run(() => {
        this.fcmService.escuchaMensajes()
        this.fcmService.stopListenNotificationsBack()
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
