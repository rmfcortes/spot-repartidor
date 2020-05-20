import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  ILatLng
} from '@ionic-native/google-maps/ngx';

import { UbicacionService } from 'src/app/services/ubicacion.service';

import { Cliente } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  @Input() cliente: Cliente;

  map: GoogleMap;

  repartidorMaker: Marker
  clienteLatLng: ILatLng

  pinRepartidor = '../../../assets/img/repartidor.png';
  pinCasa = '../../../assets/img/pin.png';

  constructor(
    private modalCtrl: ModalController,
    private ubicacionService: UbicacionService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.clienteLatLng = {
      lat: this.cliente.direccion.lat,
      lng: this.cliente.direccion.lng
    }
    this.loadMap();
  }

  loadMap() {
    if(this.map){
      this.map.clear();
    }
    // This code is necessary for browser
    // Environment.setEnv({
    //   'API_KEY_FOR_BROWSER_RELEASE': '(your api key for `https://`)',
    //   'API_KEY_FOR_BROWSER_DEBUG': '(your api key for `http://`)'
    // });

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: this.clienteLatLng,
         zoom: 17
       }
    }
    this.map = GoogleMaps.create('map_canvas', mapOptions);

    console.log(this.map);
    this.trackMe();

    this.map.addMarkerSync({
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: this.cliente.direccion.lat,
        lng: this.cliente.direccion.lng
      }
    });
    // marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
    //   alert('clicked');
    // });
  }

  trackMe() {
    this.ubicacionService.ubicacion.subscribe(ubicacion => {
      const position: ILatLng = {
        lat: ubicacion.lat,
        lng: ubicacion.lng
      }
      if (!this.repartidorMaker) {
        this.repartidorMaker = this.map.addMarkerSync({
          icon: './assets/img/repartidor.png',
          animation: 'DROP',
          position
        })
      } else {
        this.repartidorMaker.setPosition(position)
      }
      const markers: ILatLng[] = [position, this.clienteLatLng]
      this.map.moveCamera({
        target: markers
      })
    })
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
