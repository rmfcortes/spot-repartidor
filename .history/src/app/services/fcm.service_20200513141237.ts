import { Injectable, NgZone } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { FCM, NotificationData } from '@ionic-native/fcm/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

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
    this.notifcationSub = this.fcm.onNotification().subscribe((msg: NotificationData) => {
      this.ngZone.run(() => {
        this.fcm.clearAllNotifications()
        if (msg.idPedido) {
          const nuevo_pedido: Notificacion = {
            cliente: msg.cliente,
            cliente_direccion: msg.cliente_direccion,
            cliente_lat: parseInt(msg.cliente_lat, 10),
            cliente_lng: parseInt(msg.cliente_lng, 10),
            idPedido: msg.idPedido,
            negocio: msg.negocio,
            negocio_direccion: msg.negocio_direccion,
            negocio_lat: parseInt(msg.negocio_lat, 10),
            negocio_lng: parseInt(msg.negocio_lng, 10),
            notificado: parseInt(msg.notificado, 10)
          }
          this.pedido_nuevo.next(nuevo_pedido)
        }
      })
    })
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
