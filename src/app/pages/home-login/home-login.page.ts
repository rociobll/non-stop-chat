import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAvatar, IonButton, IonContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-login',
  templateUrl: './home-login.page.html',
  styleUrls: ['./home-login.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonText, CommonModule, IonButton, IonAvatar, IonImg, IonIcon]
})
export class HomeLoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  user$ = this.auth.user$;

  ngOnInit() {}



  login() {
      this.auth.loginGoogle();
    }

  logOut() {
    console.log('Cierre de sesión clicado');

    this.auth.logOut();
  }

}


