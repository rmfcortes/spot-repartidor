import { Injectable } from '@angular/core';

import { UidService } from './uid.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  constructor(
    private commonService: CommonService,
    private uidService: UidService,
  ) { }

    // Check Region

    checkRegion(): Promise<boolean> {
      return new Promise(async (resolve, reject) => {
        let region;
        region = this.uidService.getRegion()
        if (region) return resolve(true)
        region = await this.getRegion()
        if (region) return resolve(true)
        region = await this.getRegionDB()
        if (region) return resolve(true)
        return resolve(false);
      });
    }
  
    getRegion(): Promise<boolean> {
      return new Promise (async (resolve, reject) => {
        const region = await this.commonService.getVariableFromStorage('region')
        if (region) {
          this.uidService.setRegion(region);
          resolve(true)
        } else resolve(false)
      });
    }
  
    getRegionDB() {
      const uid = this.uidService.getUid()
      const regSub = this.db.object(`repartidores_tokens/${uid}/region`).valueChanges().subscribe(region => {
        regSub.unsubscribe()
      }, )
    }

}
