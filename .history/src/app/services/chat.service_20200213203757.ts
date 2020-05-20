import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Mensaje } from '../interfaces/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  listenMsg() {
    const idRepartidor = this.uidService.getUid();
    return this.db.list(`chatRepa/${idRepartidor}/unread`).valueChanges();
  }

  setSeen(idPedido) {
    const idRepartidor = this.uidService.getUid();
    this.db.object(`chatRepa/${idRepartidor}/unread/${idPedido}`).remove();
  }

  newMsg(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.list(`chatRepa/${idRepartidor}/todos/${idPedido}`);
  }

  listenStatus(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.object(`chatRepa/${idRepartidor}/status/${idPedido}`).valueChanges();
  }

  listenUnread(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.object(`chatRepa/${idRepartidor}/unread/${idPedido}`).valueChanges();
  }

  publicarMsg(idPedido: string, msg: Mensaje) {
    const idRepartidor = this.uidService.getUid();
    this.db.object(`chatRepa/${idRepartidor}/status/${idPedido}`).remove();
    this.db.list(`chatRepa/${idRepartidor}/todos/${idPedido}`).push(msg);
  }

}
