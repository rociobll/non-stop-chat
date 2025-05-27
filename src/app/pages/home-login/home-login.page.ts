import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonImg,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-home-login',
  templateUrl: './home-login.page.html',
  styleUrls: ['./home-login.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    IonContent,
    IonText,
    CommonModule,
    IonButton,
    IonAvatar,
    IonImg,
    IonIcon,
    IonFooter,
    IonToolbar,
  ],
})
export class HomeLoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.user$;

  private userSub!: Subscription;

  ngOnInit() {
    this.userSub = this.user$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/chat']);
      }
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  login() {
    this.auth.loginGoogle();
  }

  logOut() {
    const confirmation = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!confirmation) return;

    this.auth.logOut();
  }

  // Método para arreglar el error de carga de la imagen de avatar
  handleImageError(event: any) {
    const imgElement = event.target;
    imgElement.src = '../../../assets/icon/woman2-avatar.png'; // cambia la ruta a la imagen por defecto
  }
}
