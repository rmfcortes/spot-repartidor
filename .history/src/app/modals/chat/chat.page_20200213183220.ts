import { Component, OnInit, ViewChild, Input, NgZone } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Mensaje, UnreadMsg } from 'src/app/interfaces/chat';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent;
  @Input() idPedido;
  @Input() nombreCliente;

  messages: Mensaje[] = [];

  newMsg = '';

  status = '';

  unReadSub: Subscription;
  stateSub: Subscription;

  constructor(
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private chatService: ChatService,
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.chatService.setSeen(this.idPedido);
    this.listenMsg();
    this.setSeen();
    this.listenState();
  }

  listenMsg() {
    this.chatService.newMsg(this.idPedido).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const mensaje = snapshot.val();
        this.messages.push(mensaje);
        setTimeout(() => {
          this.content.scrollToBottom(0);
        });
      });
    });
  }

  setSeen() {
    this.chatService.setSeen(this.idPedido);
  }

  listenUnread() {
    this.unReadSub = this.chatService.listenUnread(this.idPedido).subscribe((mensajes: UnreadMsg[]) => {
        if (mensajes && mensajes.length > 0) {
          this.setSeen();
        }
    });
  }

  listenState() {
    this.stateSub = this.chatService.listenStatus(this.idPedido).subscribe((estado: any) => {
      this.status = estado || null;
    });
  }

  sendMessage() {
    const newMsg: Mensaje = {
      isMe: false,
      createdAt: new Date().getTime(),
      msg: this.newMsg,
    };
    this.chatService.publicarMsg(this.idPedido, newMsg);
    this.newMsg = '';
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
  }

  regresar() {
    this.chatService.newMsg(this.idPedido).query.ref.off('child_added');
    if (this.unReadSub) { this.unReadSub.unsubscribe(); }
    if (this.stateSub) { this.stateSub.unsubscribe(); }
    this.modalCtrl.dismiss();
  }

}
