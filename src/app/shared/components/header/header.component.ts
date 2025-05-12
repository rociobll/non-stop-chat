import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, IonImg, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonIcon,IonLabel, IonImg, IonAvatar, IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, UpperCasePipe, AsyncPipe]

})
export class HeaderComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
  private readonly auth = inject(AuthService);


  appName = signal('NonStopChat');
  user$ = this.auth.currentUserObs;



  login() {
    this.auth.loginGoogle();
    console.log('Usuario autenticado', (this.user$));

  }

  logOut() {
    this.auth.logOut();
      console.log('Usuario deslogueado');
     console.log(this.user$);

    }
}

