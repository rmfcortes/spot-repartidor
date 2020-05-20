import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { PedidoPage } from 'src/app/modals/pedido/pedido.page';
import { ChatPage } from 'src/app/modals/chat/chat.page';

import { PermissionsService } from 'src/app/services/permissions.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

import { Pedido, Cliente } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat';
import { CommonService } from 'src/app/services/common.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pedidos: Pedido[] = []
  nombre: string

  msgSub: Subscription
  pedidosSub: Subscription
  permisosSub: Subscription

  isModal = false

  constructor(
    private router: Router,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private permisosService: PermissionsService,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private pedidoService: PedidoService,
    private chatService: ChatService,
    private uidService: UidService,
  ) {}

  ionViewWillEnter() {
    console.log('Enter');
    this.nombre = this.uidService.getNombre()
    this.getPedidos()
    this.listenPermisos()
    this.ubicacionService.initBackgroundMode();
    this.ubicacionService.trackPosition()
  }

  listenPermisos() {
    this.permisosService.permisos.subscribe(permisos => {
      if (!permisos.token || !permisos.gps || !permisos.location || !permisos.fcm) {
        this.router.navigate(['/permisos'])
      }
    })
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
    this.pedidosSub = this.pedidoService.getPedidos().subscribe((pedidos: Pedido[]) => {
      console.log(pedidos);
      this.pedidos = pedidos;
      if (this.pedidos && this.pedidos.length > 0) {
        this.listenNewMsg()
      } else {
        if (this.msgSub) { this.msgSub.unsubscribe(); }
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
    this.commonService.setClienteTemporal(cliente)
    this.router.navigate(['/mapa'])
  }

  ionViewWillLeave() {
    if (this.msgSub) this.msgSub.unsubscribe()
    if (this.pedidosSub) this.pedidosSub.unsubscribe()
    if (this.permisosSub) this.permisosSub.unsubscribe()
    this.ubicacionService.detenerUbicacion()
  }

}
