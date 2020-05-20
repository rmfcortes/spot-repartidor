import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pedido } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getToken(): Promise<boolean>  {
    return new Promise((resolve, reject) => {
     const uid = this.uidService.getUid();
     const region = this.uidService.getRegion()
     const tokSub = this.db.object(`repartidores_asociados_data/${region}/${uid}/token`).valueChanges().subscribe((token: string) => {
       tokSub.unsubscribe();
       if (token) resolve(true)
       else resolve(false)
     });
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
