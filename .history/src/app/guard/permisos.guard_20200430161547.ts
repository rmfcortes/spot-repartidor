import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';
@Injectable({
  providedIn: 'root'
})
export class PermisosGuard implements CanActivate {

  constructor(
    private router: Router,
    private permissionService: PermissionsService,
    private authService: AuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.authService.getUser()
      .then(uid => {
        if (uid) {
          return this.permissionService.getToken();
        } else {
          this.router.navigate(['/login'])
          return false
        }
      })
      .then(token => {
        if (token) {
          return this.permissionService.isLocationAuthorized()
        } else {
          this.router.navigate(['/permisos'])
          return false
        }
      })
      .then(location => {
        if (location) {
          return this.permissionService.isGpsLocationEnabled()
        } else {
          this.router.navigate(['/permisos'])
          return false
        }
      })
      .then(gps => {
        if (gps) {
          return this.permissionService.isRemoteNotificationsEnabled()
        } else {
          this.router.navigate(['/permisos'])
          return false
        }
      })
      .catch(err => {
        console.log(err)
        this.router.navigate(['/login'])
        return false
      })
  }

}
