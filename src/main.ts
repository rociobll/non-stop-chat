
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Configuracion Firebase y Base datos:
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';  //conectar inicar app con firebase
import { provideAuth, getAuth } from '@angular/fire/auth';  //servicios autenticación
//import { getFirestore, provideFirestore } from '@angular/fire/firestore'; //bbdd de firestore, si se usase
import { getDatabase, provideDatabase } from '@angular/fire/database'; //bbdd Realtime que es la que uso


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
   // provideFirestore(() => getFirestore()), //para bbdd firebase
    provideDatabase(() => getDatabase()), // para bbdd Realtimedatabase la que usaré


  ],
}).catch((error) => console.log(error));

