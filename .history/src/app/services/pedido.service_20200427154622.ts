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
