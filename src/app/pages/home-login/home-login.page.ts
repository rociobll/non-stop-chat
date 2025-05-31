import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonImg,
  IonText,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-login',
  templateUrl: './home-login.page.html',
  styleUrls: ['./home-login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonText,
    CommonModule,
    IonButton,
    IonAvatar,
    IonImg,
    IonIcon,
    IonFooter,
  ],
})
export class HomeLoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  user = this.auth.user;

  ngOnInit() {
    console.log('User:', this.user());

    setTimeout(() => {
      console.log('User:', this.auth.getUser());
      if (this.auth.getUser()) {
        this.router.navigate(['/chat']);
      }
    }, 2000); // Espera 1 segundo antes de verificar el estado del usuario
  }

  login() {
    this.auth.loginGoogle();
  }

  logOut() {
    this.auth.logOut();
  }

  // Método para arreglar error carga de imagen de avatar
  handleImageError(event: any) {
    const imgElement = event.target;
    imgElement.src = '../../../assets/icon/woman2-avatar.png';
  }
}
