import { Injectable, NgZone } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { FCM, NotificationData } from '@ionic-native/fcm/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { BackgroundModeService } from './background-mode.service';

import { UidService } from './uid.service';
import { Notificacion } from '../interfaces/pedido';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string;
  notifcationSub: Subscription;

  pedido_nuevo = new BehaviorSubject<Notificacion>(null)

  constructor(
    private fcm: FCM,
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    private backgroundService: BackgroundModeService,
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
        reject(error)
      })
    });
  }

  escuchaMensajes() {
    this.notifcationSub = this.fcm.onNotification().subscribe((msg: NotificationData) => {
      this.ngZone.run(() => {
        this.fcm.clearAllNotifications()
        if (msg.idPedido) {
          this.newNotification(msg)
        }
      })
    })
  }

  newNotification(notification) {
    const nuevo_pedido: Notificacion = {
      cliente: notification.cliente,
      cliente_direccion: notification.cliente_direccion,
      cliente_lat: parseInt(notification.cliente_lat, 10),
      cliente_lng: parseInt(notification.cliente_lng, 10),
      idPedido: notification.idPedido,
      negocio: notification.negocio,
      negocio_direccion: notification.negocio_direccion,
      negocio_lat: parseInt(notification.negocio_lat, 10),
      negocio_lng: parseInt(notification.negocio_lng, 10),
      notificado: parseInt(notification.notificado, 10)
    }
    this.pedido_nuevo.next(nuevo_pedido)
  }

  listenNotificationsOnBackground() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.on('child_added', snap => {
      this.backgroundService.unlock()
      const notification = snap.val()
      this.newNotification(notification)
    })
  }

  stopListenNotificationsBack() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.off('child_added')
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
