import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonInput, IonRow, IonText, IonTitle } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [ RouterLink, CommonModule, FormsModule, ReactiveFormsModule, IonContent,
     IonText, IonButton, IonInput, IonAvatar, IonIcon, IonImg, IonGrid, IonCol, IonRow]
})
export class ChatPage implements OnInit {

  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);

  user$ = this.authService.user$;
  messages= this.chatService.getMessages();
  // totalMessages = toSignal(this.messages$, {initialValue: []}); //converto a signal para no tener que usar pipe async como en user$
  totalMessages = this.chatService.getMessages;
  messageInput = new FormControl('', [Validators.required]);

  constructor() { }

  ngOnInit() {
    this.chatService.loadMessages(); //cargar mensajes de Realtime
    // this.chatService.getMessages().subscribe(msgs => {
    //   this.totalMessages = msgs;
    // });
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
