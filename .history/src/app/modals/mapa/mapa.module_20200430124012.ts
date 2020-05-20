import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgmCoreModule } from '@agm/core';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';

import { MapaPage } from './mapa.page';

import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: environment.mapsApiKey
    }),
  ],
  providers: [GoogleMaps],
  declarations: [MapaPage],
  entryComponents: [MapaPage]
})
export class MapaPageModule {}
