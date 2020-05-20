import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  newMsg() {
    const idRepartidor = this.uidService.getUid();
    return this.db.object(`usuarios/${idRepartidor}/chat/${idRepartidor}/msgPend`).valueChanges();
  }

  listenMsg(idCliente) {
    return this.db.list(`chats/${this.uid}/${idCliente}/mensajes`);
  }

}
