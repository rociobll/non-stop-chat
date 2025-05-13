import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, IonContent, IonTitle, IonToolbar, IonButton, IonIcon, IonInput ]
})
export class ChatPage implements OnInit {

  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);

  inputText = signal('');
  messageInput = new FormControl('', [Validators.required]);

  constructor() { }

  ngOnInit() {
  }

  // testAddMessage() {
  //   this.chatService.sendMessage('¡hola es un mensaje de prueba!')
  //   .then(() =>{
  //     console.log('Mensaje de prueba para fecha e id');
  //   })
  //   .catch((error)=> {
  //     console.log('Error al añadir mensaje de prueba', error);
  //   });
  // }

  sendMessage() {
    if(this.messageInput.invalid) return;

    const text = this.messageInput.value?.trim();
    if(text) {
      this.chatService.sendMessage(text);
      this.messageInput.reset();
    }
  }


  logOut() {
    console.log('Cierre de sesión clicado');

    this.authService.logOut();
  }

}
