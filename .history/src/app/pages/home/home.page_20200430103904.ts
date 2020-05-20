import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { PedidoPage } from 'src/app/modals/pedido/pedido.page';
import { MapaPage } from 'src/app/modals/mapa/mapa.page';
import { ChatPage } from 'src/app/modals/chat/chat.page';

import { UbicacionService } from 'src/app/services/ubicacion.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

import { Pedido, Cliente } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pedidos: Pedido[] = [];
  nombre: string;

  newMsg: Subscription;
  msgSub: Subscription;

  constructor(
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private ubicacionService: UbicacionService,
    private pedidoService: PedidoService,
    private chatService: ChatService,
    private uidService: UidService,
  ) {}

  ionViewWillEnter() {
    this.nombre = this.uidService.getNombre()
    this.listenNewMsg()
    this.getPedidos()
  }

  listenNewMsg() {
    this.msgSub = this.chatService.listenMsg().subscribe((unReadmsg: UnreadMsg[]) => {
      this.pedidos.forEach(p => {
        const i = unReadmsg.findIndex(u => u.idPedido === p.id);
        if (i >= 0) {
          p.unRead = unReadmsg[i].cantidad;
        } else {
          p.unRead = 0;
        }
      });
    });
  }

  getPedidos() {
    this.pedidoService.getPedidos().subscribe((pedidos: Pedido[]) => {
      console.log(pedidos);
      this.pedidos = pedidos;
      if (this.pedidos && this.pedidos.length > 0) {
        this.ubicacionService.watchPosition();
      } else {
        this.ubicacionService.detenerUbicacion();
      }
    });
  }

  llamar(numero) {
    this.callNumber.callNumber(numero, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err));
  }

  async verPedido(pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoPage,
      componentProps: {pedido}
    });

    return await modal.present();
  }

  async verChat(idCliente: string, idPedido: string, nombreCliente: string) {
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: { idCliente, idPedido, nombreCliente }
    });

    return await modal.present();
  }

  async verMapa(cliente: Cliente) {
    const modal = await this.modalCtrl.create({
      component: MapaPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { cliente }
    });

    return await modal.present();
  }

  ionViewWillLeave() {
    if (this.msgSub) { this.msgSub.unsubscribe(); }

  }

}
