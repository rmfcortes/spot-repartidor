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

  listenMsg() {
    const idRepartidor = this.uidService.getUid();
    return this.db.list(`chatRepa/${idRepartidor}/unread`).valueChanges();
  }

}
