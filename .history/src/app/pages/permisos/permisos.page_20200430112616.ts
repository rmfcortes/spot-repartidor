import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PermissionsService } from 'src/app/services/permissions.service';
import { FcmService } from 'src/app/services/fcm.service';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.page.html',
  styleUrls: ['./permisos.page.scss'],
})
export class PermisosPage implements OnInit {

  fcmToken = false
  fcmPermission = false
  gpsPermission = false
  gpsActivated = false

  constructor(
    private router: Router,
    private permissionService: PermissionsService,
    private fcmService: FcmService,
  ) { }

  ngOnInit() {
    this.isRemoteNotificationsEnabled()
    this.isLocationAuthorized()
    this.isGpsLocationEnabled()
  }

    // Check permissions

    getToken() {
      this.permissionService.getToken()
      .then(token => this.fcmToken = token)
      .catch(err => {
        console.log(err)
        this.fcmToken = false
      })
    }

  isRemoteNotificationsEnabled() {
    this.permissionService.isRemoteNotificationsEnabled()
    .then(resp => {
      console.log(resp)
      this.fcmPermission = resp
      this.puedeRecibirPedidos()
    })
    .catch(err => {
      console.log(err)
      this.fcmPermission = false
    })
  }

  isLocationAuthorized() {
    this.permissionService.isLocationAuthorized()
    .then(resp => {
      console.log(resp)
      this.gpsPermission = resp
      this.puedeRecibirPedidos()
    })
    .catch(err => {
      console.log(err)
      this.gpsPermission = false
    })
  }

  isGpsLocationEnabled() {
    this.permissionService.isGpsLocationEnabled()
    .then(resp => {
      console.log(resp)
      this.gpsActivated = resp
      this.puedeRecibirPedidos()
    })
    .catch(err => {
      console.log(err)
      this.gpsActivated = false
    })
  }

  // Request 

  async activaFCM()  {
    this.fcmService.requestToken()
    .then(() => this.fcmPermission = true)
    .catch((error) => {
      console.log(error);
      this.fcmPermission = false
    })
  }

  requestLocationAuthorization() {
    this.permissionService.requestLocationAuthorization()
    .then(resp => {
      this.gpsPermission = resp
      if (resp) this.puedeRecibirPedidos()
    })
    .catch(err => console.log(err))
  }

  requestHighAccuracyLocation() {
    this.permissionService.requestHighAccuracyLocation()
    .then(resp => {
      this.gpsActivated = resp
      if (resp) this.puedeRecibirPedidos()
    })
    .catch(err => console.log(err))
  }

  puedeRecibirPedidos() {
    if (this.fcmPermission && this.gpsPermission && this.gpsActivated && this.fcmToken) {
      this.router.navigate(['/home'])

    }
  }

}
