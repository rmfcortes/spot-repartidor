import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { Geoposition } from '@ionic-native/geolocation/ngx';

import { UbicacionService } from './ubicacion.service';
import { UidService } from './uid.service';

import { Pedido } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private db: AngularFireDatabase,
    private ubicacionService: UbicacionService,
    private uidService: UidService,
  ) { }

  esAsociado() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const asocSub = this.db.object(`repartidores_asociados/${uid}`).valueChanges().subscribe(async (asociado) => {
        asocSub.unsubscribe()
        try {          
          if (asociado) {
            this.uidService.setAsociado(true)
            const ubicacion: Geoposition = await this.ubicacionService.getPositionProm()
            await this.db.object(`repartidores_asociados_data/${uid}`)
          } else {
            this.uidService.setAsociado(false)
            await this.db.object(`repartidores_asociados_data/${uid}`).remove()
          }
        } catch (error) {
          console.log(error);
        }
      })
    });
  }

  getPedidos() {
    const idRepartidor = this.uidService.getUid();
    return this.db.list(`asignados/${idRepartidor}`).valueChanges();
  }

  async finalizarPedido(pedido: Pedido) {
    const idRepartidor = this.uidService.getUid();
    await this.db.object(`asignados/${idRepartidor}/${pedido.id}/entregado`).set(Date.now());
    this.db.object(`asignados/${idRepartidor}/${pedido.id}`).remove();
    this.db.object(`chatRepa/${idRepartidor}/todos/${pedido.id}`).remove();
    this.db.object(`chatRepa/${idRepartidor}/unread/${pedido.id}`).remove();
    this.db.object(`chatRepa/${idRepartidor}/status/${pedido.id}`).remove();
  }

}
