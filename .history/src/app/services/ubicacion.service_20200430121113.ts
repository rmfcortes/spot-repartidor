import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';


@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  public ubicacion = new BehaviorSubject({
    lat: 22.571956,
    lng: -102.253399
  });

  wathSubscription: Subscription;
  backSubscription: Subscription;
  deActBackSubscription: Subscription;
  backInterval: any;
  intervalo = 1000 * 10;

  options: GeolocationOptions = {
    enableHighAccuracy: true,
  };

  lastLoc = {
    lat: null,
    lng: null
  };

  constructor(
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    public geolocation: Geolocation,
    public backgroundMode: BackgroundMode,
    private uidService: UidService,
  ) { }

  // Inicializar BackMode, Watch

  async initBackgroundMode() {
    this.backgroundMode.setDefaults({silent: true})
    if (!this.backSubscription) this.setBackMode()
    if (!this.deActBackSubscription) this.setFrontMode()
    this.backgroundMode.enable()
  }

  setBackMode() {
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        this.backgroundMode.disableWebViewOptimizations();
        if (!this.backInterval) {
          this.backInterval = setInterval(() => {
            if (this.wathSubscription) { this.wathSubscription.unsubscribe(); }
            this.wathSubscription = null;
            this.getPositionVoid();
          }, this.intervalo);
        }
      });
    });
  }

  setFrontMode() {
    this.deActBackSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      clearInterval(this.backInterval)
      this.backInterval = null
      this.watchPosition()
    });
  }

  // Ubicar

  getPositionVoid(): void {
    this.geolocation.getCurrentPosition(this.options)
      .then(async (position: Geoposition) => {
        this.ngZone.run(async () => {
          this.comparaLoc(position);
        });
      }).catch(err => {
        this.ngZone.run(() => {
          console.log(err);
        });
      });
  }

  getPositionProm(): Promise<Geoposition> {
    return new Promise((resolve, reject) => {      
      this.geolocation.getCurrentPosition(this.options)
        .then(async (position: Geoposition) => {
          this.ngZone.run(async () => {
            resolve(position)
          });
        }).catch(err => {
          this.ngZone.run(() => {
            console.log(err);
            reject(err)
          });
        });
    });
  }

  watchPosition() {
    this.wathSubscription = this.geolocation.watchPosition(this.options)
    .subscribe((position: Geoposition) => {
      this.ngZone.run(async () => {
        console.log(position);
        this.comparaLoc(position);
      }, err => console.log(err));
    });
  }

  // Compara si no es una ubicación erronea

  async comparaLoc(position: Geoposition) {
    if (position.coords.accuracy > 25) {
      return;
    }
    if (!this.lastLoc.lat || !this.lastLoc.lng) {
      this.lastLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.updateLocation(position);
    } else {
      const d = await this.calculaDistancia(
        this.lastLoc.lat,
        this.lastLoc.lng,
        position.coords.latitude,
        position.coords.longitude,
      );
      if (d < 5) {
        // Muy cerca
        return;
      } else {
        this.lastLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.updateLocation(position);
      }
    }
  }

  // Suba ubicación a base de datos

  async updateLocation(data: Geoposition) {
    const coords = {
      lat: data.coords.latitude,
      lng: data.coords.longitude,
    };
    this.ubicacion.next(coords);
    const idRepartidor = this.uidService.getUid();
    this.db.object(`ubicaciones/${idRepartidor}`).set(coords);
  }

  // Detener geolocalización

  async detenerUbicacion() {
    if (this.backSubscription) { this.backSubscription.unsubscribe(); }
    if (this.wathSubscription) { this.wathSubscription.unsubscribe(); }
    if (this.deActBackSubscription) { this.deActBackSubscription.unsubscribe(); }
    clearInterval(this.backInterval);
    this.backgroundMode.setEnabled(false);
  }

  // Auxiliares

  calculaDistancia( lat1, lng1, lat2, lng2 ): Promise<number> {
    return new Promise ((resolve, reject) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);  // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1);
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
         ;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c * 1000; // Distance in mts
      resolve(d);
    });
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180);
  }

}
