import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAvatar, IonButton, IonContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-home-login',
  templateUrl: './home-login.page.html',
  styleUrls: ['./home-login.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent,  IonText, CommonModule, IonButton, IonAvatar, IonImg, IonIcon]
})
export class HomeLoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  user$ = this.auth.user$;

  ngOnInit() {
    this.auth.user$.pipe(first()).subscribe(user => {  //pipe(first())esperamos el 1º valor del observable si esta logueado va al chat y no se mantiene la suscripción abierta
      if(user) {
        this.router.navigate(['/chat']);
      }
    });
   }


  login() {
    console.log('Login with Google clicked');

    this.auth.loginGoogle().then((user) => {
      console.log('User logged in:', user);
      this.router.navigate(['/chat']);
    }).catch((error) => {
      console.error('Error logging with Google:', error);
    });
  }

  logOut() {
    console.log('Cierre de sesión clicado');

    this.auth.logOut();
  }


}


