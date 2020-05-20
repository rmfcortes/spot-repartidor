import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { AlertService } from 'src/app/services/alert.service';
import { PedidoService } from 'src/app/services/pedido.service';

import { Pedido } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit {

  @Input() pedido: Pedido;

  constructor(
    private modalCtrl: ModalController,
    private alertService: AlertService,
    private pedidoService: PedidoService,
  ) { }

  ngOnInit() {
  }

  entregar() {
    this.alertService.presentAlertConfirm('Finalizar pedido',
      'Sólo finaliza el pedido si ya tienes el dinero en tus manos. '+
      `Confirma que recibes $ ${this.pedido.total}`)
      .then(resp => {
        if (resp) {
          this.pedidoService.finalizarPedido(this.pedido)
          this.pedido = null
          this.regresar()
        }
      });
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}
