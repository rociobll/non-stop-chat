import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonInput, IonRow, IonText, IonTitle } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';
import { Message } from 'src/app/interfaces/message.interface';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [ RouterLink, CommonModule, FormsModule, ReactiveFormsModule, IonContent, IonTitle,
     IonText, IonButton, IonInput, IonAvatar, IonIcon, IonImg, IonGrid, IonCol, IonRow]
})
export class ChatPage implements OnInit {

  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);

  user$ = this.authService.user$;
  totalMessages: Message[] = [];
  messageInput = new FormControl('', [Validators.required]);

  constructor() { }

  ngOnInit() {
  }

   sendMessage() {
    if(this.messageInput.invalid) return;

    const text = this.messageInput.value?.trim();    //cogemos el mensaje y quitamos espacios en blanco y si queda texto se envia
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
