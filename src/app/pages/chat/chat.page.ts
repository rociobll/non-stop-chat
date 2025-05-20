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
    IonText, IonButton, IonInput, IonAvatar, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner]
})
export class ChatPage implements OnInit {

  chatService = inject(ChatMessagesService);
  authService = inject(AuthService);
  locationService = inject(GeolocationService);

  userInfo = this.authService.getUserInfo();
  user: User | null = null
  messageInput = new FormControl('', [Validators.required]);
  messages = this.chatService.getMessages();
  userLocation = signal<string>(''); // Almacenar la ubicación del usuario
  allowAutoScroll = true;
  isLoadingMore = signal<boolean>(false);
  hasMoreMessages = false; // Variable para controlar si hay más mensajes para cargar

  constructor() { }


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

          // Enable infinite scroll if there are more messages
          if (this.infiniteScroll) {
            const hasMore = this.chatService.totalMessages() > this.chatService.currentLimit();
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

  loadMoreMessages(event: any) {
    this.chatService.loadMoreMessages().then(hasMore => {
      event.target.complete();
      if(!hasMore) {
        event.target.disabled = true;
      }
    })
  }


  async sendMessage() {
    if (this.messageInput.invalid) return;

    const text = this.messageInput.value?.trim();    //cogemos el mensaje y quitamos espacios en blanco y si queda texto se envia
    if (text) {

      try {
        this.allowAutoScroll = true; // Activar el scroll automático al enviar un mensaje
        await this.chatService.createMessage(text);
        this.messageInput.reset();
        this.chatService.currentLimit.set(10);  //cuando se envia nuevo mensaje, reiniciamos limite a 10 para que cargue los ultomos10 mensajes denuevo
        // this.chatService.loadMessages();
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
        this.chatService.loadMessages(); //volver a cargar mensaje con limit 10

      } catch (error) {
        console.error('Error enviando mensaje:', error);
      }
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

    // Método para arreglar el error de carga de la imagen de avatar desde Google (a vcees carga y a veces no)
    handleImageError(event: any) {
      const imgElement = event.target;
      imgElement.src = '../../../assets/icon/woman2-avatar.png'; // cambia la ruta a la imagen por defecto si no se carga de google
    }


}
