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
  Environment
} from '@ionic-native/google-maps';

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

  ubicacion = {
    lat: null,
    lng: null
  };

  pinRepartidor = '../../../assets/img/repartidor.png';
  pinCasa = '../../../assets/img/pin.png';

  constructor(
    private modalCtrl: ModalController,
    private ubicacionService: UbicacionService,
  ) { }

  ngOnInit() {
    this.trackMe();
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  loadMap() {

    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': '(your api key for `https://`)',
      'API_KEY_FOR_BROWSER_DEBUG': '(your api key for `http://`)'
    });

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: {
           lat: 43.0741904,
           lng: -89.3809802
         },
         zoom: 18,
         tilt: 30
       }
    }
    this.map = GoogleMaps.create('map_canvas', mapOptions);

    let marker: Marker = this.map.addMarkerSync({
      title: 'Ionic',
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: 43.0741904,
        lng: -89.3809802
      }
    });
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      alert('clicked');
    });
  }

  trackMe() {
    this.ubicacionService.ubicacion.subscribe(ubicacion => {
      this.ubicacion = ubicacion;
    });
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
