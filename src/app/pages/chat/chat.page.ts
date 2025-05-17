import { User } from '@angular/fire/auth';
import { Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonAvatar, IonButton, IonCol, IonContent, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonItem, IonList, IonRow, IonSpinner, IonText } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';
import { GeolocationService } from 'src/app/services/geolocation.service';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, IonContent,
    IonText, IonButton, IonInput, IonAvatar, IonIcon, IonImg, IonCol, IonRow, IonList, IonItem, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner]
})
export class ChatPage implements OnInit {

  private chatService = inject(ChatMessagesService);
  authService = inject(AuthService);
  locationService = inject(GeolocationService);


  user: User | null = null
  // totalMessages = toSignal(this.messages$, {initialValue: []}); //converto a signal para no tener que usar pipe async como en user$
  // totalMessages = this.chatService.getMessages;
  messageInput = new FormControl('', [Validators.required]);
  isLoading = signal<boolean>(false);
  messages = this.chatService.getMessages();
  userLocation = signal<string>(''); // Almacenar la ubicación del usuario
  allowAutoScroll = true;
  lastAmountMgs = 0;

  constructor() {

    effect(() => {
      const messages = this.messages();
      if (messages.length > 0 && messages.length !== this.lastAmountMgs) {
        // Solo hacer scroll si son mensajes nuevos (no cargados del historial)
        if (messages.length > this.lastAmountMgs) {
          setTimeout(() => this.scrollToBottom(), 100);
          this.scrollToBottom();
        }
        this.lastAmountMgs = messages.length;
      }
    });
  }


  @ViewChild(IonContent) content!: IonContent;
  // @ViewChild('messagesBox') private messagesBox!: ElementRef;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;



  async ngOnInit() {

    try {
      // 1. Set up user subscription first
      this.authService.user$.subscribe(async user => {
        this.user = user;

        if (user) { //
          await this.chatService.requestLocationPermission();
          this.userLocation = this.chatService.getUserLocation();
          console.log('Ubicación del usuario:', this.userLocation());

          // 3. Load initial messages
          await this.chatService.loadMessages();

          // 4. Initialize infinite scroll
          if (this.infiniteScroll) {
            this.infiniteScroll.disabled = false;
          }

          // 5. Scroll to bottom after a short delay to ensure DOM is ready
          setTimeout(() => {
            this.scrollToBottom();
          }, 300);
        }
      });

    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  //  ngAfterViewChecked() {
  //   this.scrollToBottom();
  //  }

  private scrollToBottom(): void {
    if (!this.allowAutoScroll || !this.content) return;

    try {
      this.content.scrollToBottom(300);
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }
  //   try {
  //     this.messagesBox.nativeElement.scrollTop = this.messagesBox.nativeElement.scrollHeight;
  //   } catch(err) {
  //     console.error('Error al hacer scroll:', err);
  //   }
  // }
  async loadMoreMessages(event: any) {
    if (!this.infiniteScroll) return;

    this.allowAutoScroll = false;
    try {
      console.log('Loading more messages...');
      const hasMore = await this.chatService.loadMoreMessages();

      if (!hasMore) {
        this.infiniteScroll.disabled = true;
        console.log('No more messages to load');
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      event.target.complete();
    }
  }

  // async loadMoreMessages(event: any) {
  //   this.allowAutoScroll = false;
  //   try {
  //     console.log('loading more messages');
  //     const hasMore = await this.chatService.loadMoreMessages();
  //     if (!hasMore) {
  //       event.target.disabled = true; // Desactivar el scroll infinito si no hay más mensajes
  //       console.log('No more messages to load');
  //     }
      // }
      // this.allowAutoScroll = false; // Desactivar el scroll automático al cargar más mensajes
      // this.isLoading.set(true); // Marcar como cargando
      // if (!this.chatService.hasMoreMessages()) {
      //   event.target.disabled = true;
      //   return;
      // }

      // try {
      //   const moreMsgs = await this.chatService.loadMoreMessages();
      //   if (!moreMsgs) {
      //     event.target.disabled = true;
      //   }
  //   } catch (error) {
  //     console.error('Error cargando más mensajes:', error);
  //   } finally {
  //     event.target.complete();
  //   }
  // }

  //   this.allowAutoScroll = false; // Desactivar el scroll automático al cargar más mensajes
  //   try {
  //     const success = await this.chatService.loadMoreMessages();
  //     if (!success) {
  //       event.target.disabled = true; // Disable infinite scroll if no more messages
  //       console.log('No more messages to load');
  //     }
  //     // event.target.complete();
  //   } catch (error) {
  //     console.error('Error loading more messages:', error);
  //     // event.target.disabled = true;
  //   } finally {
  //     event.target.complete();
  //   }
  // }


  async sendMessage() {
    if (this.messageInput.invalid) return;

    const text = this.messageInput.value?.trim();    //cogemos el mensaje y quitamos espacios en blanco y si queda texto se envia
    if (text) {

      this.allowAutoScroll = true; // Activar el scroll automático al enviar un mensaje
      await this.chatService.createMessage(text);
      this.messageInput.reset();
      //el effect se encarga del scroll
    }
  }


  deleteAllMessages() {
    const confirmation = confirm('¿Estás seguro de que quieres eliminar todos los mensajes?');
    if (confirmation) {
      this.chatService.deleteAllMessages();
    }
  }


  logOut() {
    const confirmation = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!confirmation) return;
    console.log('Cierre de sesión clicado');

    this.authService.logOut();
  }

}
