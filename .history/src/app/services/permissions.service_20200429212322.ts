import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(
    private diagnostic: Diagnostic,
    private locationAccuracy: LocationAccuracy,
  ) { }

  // Check if application having GPS access permission
  isLocationAuthorized(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isLocationAuthorized()
      .then(status => resolve(status))
      .catch(err => reject(err))
    });
  }

  isRemoteNotificationsEnabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isRemoteNotificationsEnabled()
      .then(resp => resolve(resp))
      .catch(err => reject(err))
    });
  }

  isGpsLocationEnabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isGpsLocationEnabled() // For high accuracy
      .then(resp => resolve(resp))
      .catch(err => reject(err))
    });
  }

  requestLocationAuthorization(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.requestLocationAuthorization()
      .then(status => {
        console.log(status);
        switch(status){
          case this.diagnostic.permissionStatus.NOT_REQUESTED:
              console.log("Permission not requested");
              resolve(false)
              break;
          case this.diagnostic.permissionStatus.GRANTED:
              console.log("Permission granted");
              resolve(true)
              break;
          case this.diagnostic.permissionStatus.DENIED_ONCE:
              console.log("Permission denied");
              resolve(false)
              break;
          case this.diagnostic.permissionStatus.DENIED_ALWAYS:
              console.log("Permission permanently denied");
              resolve(false)
              break;
      }
      })
      .catch(err => reject(err))
    });
  }

  requestHighAccuracyLocation(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => resolve(true))
      .catch(err => reject(err))
    });
  }

}
