
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Configuracion Firebase y Base datos:
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';  //conectar inicar app con firebase
import { provideAuth, getAuth } from '@angular/fire/auth';  //servicios autenticación
import { getDatabase, provideDatabase } from '@angular/fire/database'; //bbdd Realtime que es la que uso
import { provideHttpClient } from '@angular/common/http';
//import { getFirestore, provideFirestore } from '@angular/fire/firestore'; //bbdd de firestore, si se usase


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideHttpClient() // para bbdd Realtimedatabase la que usaré
   // provideFirestore(() => getFirestore()), //para bbdd firebase

  ],
}).catch((error) => console.log(error));

