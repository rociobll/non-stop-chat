import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { IonAvatar, IonButton, IonContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-login',
  templateUrl: './home-login.page.html',
  styleUrls: ['./home-login.page.scss'],
  standalone: true,
  imports: [RouterLink, AsyncPipe, IonContent, IonText, CommonModule, IonButton, IonAvatar, IonImg, IonIcon]
})
export class HomeLoginPage implements OnInit {

  private readonly auth = inject(AuthService);

  user$ = this.auth.user$; //para poderacceder a datos de usuario logueado en esta página

  ngOnInit() {}


  login() {
      this.auth.loginGoogle();
    }

  logOut() {

    const confirmation = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!confirmation) return;
    console.log('Cierre de sesión clicado');

    this.auth.logOut();
  }

  // Método para arreglar el error de carga de la imagen de avatar desde Google (a vcees carga y a veces no)
  handleImageError(event: any) {
    const imgElement = event.target;
    imgElement.src = '../../../assets/icon/cuenta2-avatar.png'; // Cambia la ruta a la imagen de respaldo
  }

}


