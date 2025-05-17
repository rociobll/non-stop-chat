import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Database, onValue, push, query, ref, orderByChild, set, limitToLast } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from './geolocation.service';



@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {

  private db: Database = inject(Database);
  private authService = inject(AuthService);
  private geoService = inject(GeolocationService); // inyecto el servicio de geolocalización

  private messagesArray = signal<Message[]>([]); // cambio a signals pq me da un erro de ngzone y no quiero usar ngzone
  limitPage =10; // Cantidad inicial de mensajes a cargar
  currentLimit = signal<number>(this.limitPage); // Cantidad actual de mensajes a cargar
  totalMessages = signal<number>(0);
  isLoading = signal<boolean>(false);
  private userLocation = signal<string>(''); // Almacenar la ubicación del usuario

  constructor() {
    console.log('Iniciando servicio de chat...');

    this.setLocation(); // ubicación al iniciar el servicio
  }

  private async setLocation() {
    try {
      // Verificar permisos al inicio
      const permissionStatus = await Geolocation.checkPermissions();

      if (permissionStatus.location === 'denied') { // si los permisos denegados solicitarlos
        await Geolocation.requestPermissions();//
      }

      const locationName = await this.geoService.getLocationName();
      this.userLocation.set(locationName);
      console.log('Ubicación inicial:', locationName);
    } catch (error) {
      console.error('Error configurando ubicación:', error);
      this.userLocation.set('Ubicación no disponible');
    }
  }


  async requestLocationPermission(): Promise<void> {
    await this.setLocation();
  }


  loadMessages() {
    this.isLoading.set(true);

    const messagesQuery = query(
      ref(this.db, 'chatmessages'),
      orderByChild('timestamp'),
      limitToLast(this.currentLimit())
    );

    onValue(messagesQuery, (snapshot) => {
      const allMessages: Message[] = [];

      snapshot.forEach(snapChild => {
        const data = snapChild.val();

        allMessages.push({
          msgId: snapChild.key, ...data

        }); // Agregar el ID único al mensaje
      });
      // this.messagesArray.set(allMessages.reverse());

      allMessages.sort((a, b) => b.timestamp - a.timestamp); // Ordenar por timestamp
      this.messagesArray.set(allMessages);  // Actualizar el array de mensajes
      this.totalMessages.set(allMessages.length); // Actualizar la cantidad total de mensajes
      this.isLoading.set(false); // Marcar como no cargando después de obtener los mensajes
    });
  }



  // método para cargar más mensajes
  async loadMoreMessages(): Promise<boolean> {
    if (this.isLoading())  { // Si ya se está cargando o no hay más q cargar
      return false;
    }
    // const currentAmount = this.amountOfMessages();
    // const previousMessages = this.messagesArray();

    try {
      this.isLoading.set(true); // Marcar como cargando
      this.currentLimit.set(this.currentLimit() + this.limitPage); // Aumentar la cantidad de mensajes a cargar
      await this.loadMessages(); // Cargar mensajes que ya se habrá subido al array

      return this.totalMessages() > this.currentLimit(); // Verificar si hay más mensajes que cargar

    } catch (error) {
      console.error('Error al cargar más mensajes', error);

      this.currentLimit.set(this.currentLimit() - this.limitPage); // Revertir el límite si hay un error
      return false;
    } finally {
      this.isLoading.set(false); // Marcar como no cargando después de intentar cargar más mensajes
    }
  }

// método para verificar si hay más mensajes
  hasMoreMessages(): boolean {
    return this.totalMessages() > this.currentLimit();

  }

  getCurrentLimit() {
    return this.currentLimit;
  }
    // try {
      // const previousMessages = this.messagesArray();
    //   const currentAmount = this.currentLimit();
    //   this.amountOfMessages.set(currentAmount + 10);
    //   await this.loadMessages();
    //   return this.messagesArray().length > previousMessages.length;
    //   // try {
    //   // await this.loadMessages();
    //   // event.target.complete(); // Completar el evento de carga infinita
    // } catch (error) {
    //   console.error('Error loading messages:', error);
    //   this.amountOfMessages.set(currentAmount);
    //   return false;

      // event.target.complete(); // Completar el evento de carga infinita incluso si hay un error
      // return false;
      // }
      // } catch (error) {
      // console.error('Error  more messages:', error);
      // this.amountOfMessages.set(currentAmount);
      // return false;
    // }
  // }

  //método para obtener mensajes
  getMessages() {
    // return this.messagesArray.asObservable();
    return this.messagesArray;
  }

  // Método para obtener la cantidad actual de mensajes
  // getAmountOfMessages() {
  //   return this.amountOfMessages;
  // }


  async createMessage(text: string) {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user || !text) return false;


      const location = this.userLocation(); // Actualizar la ubicación del usuario
      const now = new Date();
      const formattedDate = now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });

      const formattedTime = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });;
      //mandar mensaje a firebase al nodo chatmessage- el id lo debe generar el push
      const messagesRef = ref(this.db, 'chatmessages');
      const newMsgRef = push(messagesRef); //vuelvo a crear la ref para poner de id de mensaje, arriba (loadMessages) solo la está leyendo
      const messageId = newMsgRef.key; // Crear un ID único para el mensaje

      const newMsg: Message = {
        userId: user.uid,
        msgId: messageId!,
        username: user.displayName || 'desconocido',
        date: formattedDate,
        hour: formattedTime,
        timestamp: now.getTime(), // Timestamp en milisegundos
        message: text,
        avatar: user.photoURL!,
        location: location // Obtener la ubicación del usuario

      };
      // guardar mensaje en Firebase
      await set(newMsgRef, newMsg);
      return true;
    } catch (error) {
      console.log('error enviando mensaje:', error);
      return false;
    }
  }

  // método público para acceder a userLocation ya q está declarada como private
  getUserLocation() {
    return this.userLocation;
  }

  async deleteAllMessages(): Promise<void> {
    try {
      const messagesRef = ref(this.db, 'chatmessages/');  // ref a ubicación de los mensajes en Firebase
      await set(messagesRef, null); // eliminar todos mens
      this.messagesArray.set([]);  //vaciar array de mensajes del servicio

    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  }

  // ----
  // const user = await firstValueFrom(this.authService.user$); // obtiene user actual(solo 1 vez sin suscribirme manualmente)- FirstVAluefrom convierte observable(user$) en promesa para usarlo con await
  // if(!user || !text) return;

  // const now = new Date();

  // const newMsg: Message = {   //se crea nuevo objeto Message
  //   id: now.toDateString(),
  //   username: user.displayName || 'desconocido',
  //   date: now.toISOString(),
  //   message: text
  // };
  // //mandar mensaje a firebase al nodo chatmessage- el id lo debe generar el push
  // const messagesRef = ref(this.db, 'chatmessages');
  // await push(messagesRef, newMsg); //esperar al envío del mensaje antes de vaciar input
  //}

}
