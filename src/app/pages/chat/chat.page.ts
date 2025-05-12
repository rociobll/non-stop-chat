import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class ChatPage implements OnInit {

  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);

  constructor() { }

  ngOnInit() {
  }

  testAddMessage() {
    this.chatService.sendMessage('¡hola es un mensaje de prueba!')
    .then(() =>{
      console.log('Mensaje de prueba agregado correctamente');
    })
    .catch((error)=> {
      console.log('Error al añadir mensaje de prueba', error);
    });
  }

  logOut() {
    console.log('Cierre de sesión clicado');

    this.authService.logOut();
  }

}
