import { Component, OnInit, OnDestroy } from '@angular/core';
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

import { Pedido, Cliente, Notificacion, Direccion } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat';
import { CommonService } from 'src/app/services/common.service';
import { FcmService } from 'src/app/services/fcm.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  pedidos: Pedido[] = []
  nombre: string

  msgSub: Subscription
  pedidosSub: Subscription
  permisosSub: Subscription

  isModal = false

  pedidos_nuevos: Notificacion[] = []
  pedidos_nuevosSub: Subscription
  cuentaActiva = false

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
    private fcmService: FcmService,
  ) {}


  ngOnInit(): void {
    console.log('Init Home');
    this.nombre = this.uidService.getNombre()
    this.getPedidos()
    this.listenPermisos()
    this.ubicacionService.initBackgroundMode()
    this.ubicacionService.trackPosition()
    this.fcmService.requestToken()
    this.isAsociado()
  }

  isAsociado() {
    this.pedidoService.isAsociado()
    .then(() => this.listenPedidosNuevos())
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

  listenPedidosNuevos() { // if is Asociado Data
    this.pedidos_nuevosSub = this.fcmService.pedido_nuevo.subscribe(pedido => {
      if (pedido) {
        if (this.pedidos_nuevos.length === 0) {
          this.pedidos_nuevos.push(pedido)
        } else {
          const i = this.pedidos_nuevos.findIndex(p => p.idPedido === pedido.idPedido)
          if (i < 0) this.pedidos_nuevos.push(pedido)
        }
        if (!this.cuentaActiva) this.cuentaRegresiva()
        console.log(this.pedidos_nuevos);
      }
    })
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

  verMapaNuevoPedido(i) {
    const direccion: Direccion = {
      direccion: this.pedidos_nuevos[i].cliente_direccion,
      lat:this.pedidos_nuevos[i].cliente_lat,
      lng:this.pedidos_nuevos[i].cliente_lng,
    }
    const cliente: Cliente = {
      direccion,
      nombre: this.pedidos_nuevos[i].cliente,
      uid: 'pendiente',
      pedido_nuevo: true
    }
    this.verMapa(cliente)
  }

  async verMapa(cliente: Cliente) {
    this.commonService.setClienteTemporal(cliente)
    this.router.navigate(['/mapa'])
  }

  
  cuentaRegresiva() {
    this.cuentaActiva = true
    setTimeout(() => {
      if (this.pedidos_nuevos.length === 0) {
        this.cuentaActiva = false
        return
      }
      for (const pedido of this.pedidos_nuevos) {
        console.log(pedido);
        const now = Date.now()
        console.log(now)
        const tolerancia = pedido.notificado + 20000
        console.log(tolerancia)
        pedido.segundos_left = tolerancia - now
        if (pedido.segundos_left <= 0) {
          this.pedidos_nuevos = this.pedidos_nuevos.filter(p => p.idPedido !== pedido.idPedido)
        }
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.msgSub) this.msgSub.unsubscribe()
    if (this.pedidosSub) this.pedidosSub.unsubscribe()
    if (this.permisosSub) this.permisosSub.unsubscribe()
    this.ubicacionService.detenerUbicacion()
  }



}
