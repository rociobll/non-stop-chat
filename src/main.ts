import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Configuracion Firebase y Base datos:
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; //conectar inicar app con firebase
import { provideAuth, getAuth } from '@angular/fire/auth'; //servicios autenticación
import { getDatabase, provideDatabase } from '@angular/fire/database'; //bbdd Realtime que es la que uso
import { provideHttpClient } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
//import { getFirestore, provideFirestore } from '@angular/fire/firestore'; //bbdd de firestore, si se usase

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()), // para bbdd Realtimedatabase la que usaré
    provideHttpClient(),
    // provideFirestore(() => getFirestore()), //para bbdd firebase

    //Hash strategy - para que al recargar en netlify no de page not found
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
}).catch((error) => console.log(error));
