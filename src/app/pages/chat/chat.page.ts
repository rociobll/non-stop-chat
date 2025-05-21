import { User } from '@angular/fire/auth';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { ChatMessagesService } from 'src/app/services/chat-messages.service';
import { GeolocationService } from 'src/app/services/geolocation.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonText,
    IonButton,
    IonInput,
    IonAvatar,
    IonIcon,
    IonImg,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
  ],
})
export class ChatPage implements OnInit {
  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);
  locationService = inject(GeolocationService);

  userInfo = this.authService.getUserInfo();
  user: User | null = null;
  messageInput = new FormControl('', [Validators.required]);
  messages = this.chatService.getMessages();
  userLocation = signal<string>('');
  allowAutoScroll = true;
  isLoadingMore = signal<boolean>(false);
  hasMoreMessages = false;

  constructor() {}

  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  async ngOnInit() {
    this.user = this.userInfo;

    if (this.userInfo) {
      try {
        await this.chatService.requestLocationPermission();
        this.userLocation = this.chatService.getUserLocation();

        setTimeout(() => {
          this.scrollToBottom();
        }, 800);

        await this.chatService.loadMessages();

        // Activar infinite-scroll
        if (this.infiniteScroll) {
          const hasMore =
            this.chatService.totalMessages() > this.chatService.currentLimit();
          console.log('Has More Messages:', hasMore);
          this.infiniteScroll.disabled = !hasMore;
          this.hasMoreMessages = hasMore;
        }
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      }
    }
  }

  scrollToBottom(): void {
    if (!this.allowAutoScroll || !this.content) return;

    try {
      this.content.scrollToBottom(300);
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  //método para cargar más mensajes - completar el evento de infinite scroll y deshabilitarlo si no hay más mensajes.
  loadMoreMessages(event: any) {
    this.chatService.loadMoreMessages().then((hasMore) => {
      this.hasMoreMessages = hasMore;

      setTimeout(() => {
        //delay para que scroll no se me dispare varias vece seguidas y aumente limites demasiado rápido
        const target = event?.target as HTMLIonInfiniteScrollElement;
        target?.complete();
        if (!hasMore) {
          target.disabled = true;
        }
      }, 500);
    });
  }

  async sendMessage() {
    if (this.messageInput.invalid) return;

    const text = this.messageInput.value?.trim();
    if (text) {
      try {
        this.allowAutoScroll = true;
        await this.chatService.createMessage(text);
        this.messageInput.reset();
        this.chatService.currentLimit.set(10); //cuando se envia nuevo mensaje, reiniciamos limite a 10 para que cargue los ultomos10 mensajes denuevo
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
        this.chatService.loadMessages(); //volver a cargar mensaje con limit 10

        this.hasMoreMessages = true; // Reactivar el scroll infinito, si no al limitar a 10 y load no hace scroll y carga pq tenia desactivado el scroll event al final de mensajes

        const infiniteScroll = document.querySelector('ion-infinite-scroll');
        if (infiniteScroll) {
          (infiniteScroll as HTMLIonInfiniteScrollElement).disabled = false;
        }
      } catch (error) {
        console.error('Error enviando mensaje:', error);
      }
    }
  }

  deleteAllMessages() {
    const confirmation = confirm(
      '¿Estás seguro de que quieres eliminar permanentemente todos los mensajes?',
    );
    if (confirmation) {
      this.chatService.deleteAllMessages();
    }
  }

  logOut() {
    const confirmation = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!confirmation) return;

    this.authService.logOut();
  }

  // Método para arreglar el error de carga de la imagen de avatar desde Google (a vcees carga y a veces no)
  handleImageError(event: any) {
    //cuando se dispare el evento de error
    const imgElement = event.target; // event.target obtener ref a elemento HTML q disparó error
    imgElement.src = '../../../assets/icon/woman2-avatar.png'; // cambia la ruta a la imagen por defecto en local
  }
}
