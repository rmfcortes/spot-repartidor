import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private storage: Storage,
    private platform: Platform,
  ) { }

  getVariableFromStorage(variable: string): Promise<string> {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          const value = this.storage.get(variable);
          resolve(value)
        });
      } else {
        // Escritorio
        const value = localStorage.getItem(variable)
        resolve(value)
      }
    });
  }
}
