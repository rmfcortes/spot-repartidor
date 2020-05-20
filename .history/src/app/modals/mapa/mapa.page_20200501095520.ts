import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapOptions,
  Marker,
  ILatLng,
  Environment,
  MarkerIcon
} from '@ionic-native/google-maps/ngx';

import { UbicacionService } from 'src/app/services/ubicacion.service';

import { Cliente } from 'src/app/interfaces/pedido';
import { environment } from '../../../../.history/src/environments/environment_20200213162712';

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
    private platform: Platform,
    private modalCtrl: ModalController,
    private ubicacionService: UbicacionService,
  ) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.platform.ready()
    this.clienteLatLng = {
      lat: this.cliente.direccion.lat,
      lng: this.cliente.direccion.lng
    }
    setTimeout(() => {
      this.loadMap();
    }, 350);
  }

  loadMap() {
    if(this.map){
      this.map.clear();
    }
    
    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': environment.mapsApiKey,
      'API_KEY_FOR_BROWSER_DEBUG': environment.mapsApiKey
    });

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: this.clienteLatLng,
         zoom: 17
       }
    }

    this.map = GoogleMaps.create('map_canvas', mapOptions)

    this.trackMe()

    const icon: MarkerIcon = {
      url: './assets/img/pin.png',
      size: {
        width: 20,
        height: 30
      }
    }

    this.map.addMarkerSync({
      icon,
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
    const icon: MarkerIcon = {
      url: './assets/img/repartidor.png',
      size: {
        width: 20,
        height: 30
      }
    }
    this.ubicacionService.ubicacion.subscribe(ubicacion => {
      const position: ILatLng = {
        lat: ubicacion.lat,
        lng: ubicacion.lng
      }
      if (!this.repartidorMaker) {
        this.repartidorMaker = this.map.addMarkerSync({
          icon,
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
      this.map.setPadding(50,50,50,50)
    })
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
