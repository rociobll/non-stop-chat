import { inject, Injectable, signal } from '@angular/core';
import { Database, onValue, push, query, ref, orderByChild, set, limitToLast, get } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { Geolocation } from '@capacitor/geolocation';
import { GeolocationService } from './geolocation.service';



@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {

  private db: Database = inject(Database);
  private authService = inject(AuthService);
  private geoService = inject(GeolocationService); // inyecto el servicio de geolocalización

  private messagesArray = signal<Message[]>([]); // cambio a signals pq me da un erro de ngzone y no quiero usar ngzone
  limitPage = 10; // Cantidad inicial y a incrementar por pág
  currentLimit = signal<number>(10); // cantidad actual de mensajes a cargar
  totalMessages = signal<number>(0);
  isLoading = signal<boolean>(false);
  private userLocation = signal<string>(''); // Almacenar la ubicación del usuario

  constructor() {
    console.log('Iniciando servicio de chat...');
  }

  private async setLocation() {
    try {
      // Verificar permisos al inicio
      // const permissionStatus = await Geolocation.checkPermissions();

      // if (permissionStatus.location === 'denied') { // si los permisos denegados solicitarlos
      //   await Geolocation.requestPermissions();//
      // }

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


  //obtener número de mensajes que hay en la base de datos realtime
  private async getTotalMessages(): Promise<number> {
    return new Promise((resolve) => {
      const totalCountRef = query(
        ref(this.db, 'chatmessages'),
        orderByChild('timestamp')
      );

      onValue(totalCountRef, (totalSnapshot) => {
        const totalInDB = totalSnapshot.size;
        this.totalMessages.set(totalInDB);
        console.log('Total mensajes en DB:', totalInDB);
        resolve(totalInDB);
      }, { onlyOnce: true });
    });
  }

  async loadMessages() {
    console.log('cargando mensajes con currentlimit:', this.currentLimit());
    this.isLoading.set(true);

    try {
      // obtener numero mensajes de bbdd
      await this.getTotalMessages();


      const messagesQuery = query(
        ref(this.db, 'chatmessages'),
        orderByChild('timestamp'),
        limitToLast(this.currentLimit())
      );


      console.log('Query creada esperando datos');

      onValue(messagesQuery, (snapshot) => {
        const allMessages: Message[] = [];
        // let count = 0;

        snapshot.forEach(snapChild => {
          const data = snapChild.val();
          allMessages.push({ msgId: snapChild.key, ...data }); // Agregar el ID único al mensaje
        });


        allMessages.sort((a, b) => a.timestamp - b.timestamp); // Ordenar por timestamp
        this.messagesArray.set(allMessages);  // Actualizar el array de mensajes


        const hasMore = this.totalMessages() > this.currentLimit();
        console.log('Mensajes proceso:', {
          totalCargados: allMessages.length,
          currentLimit: this.currentLimit(),
          totalinDb: this.totalMessages(),

          hasMore
        });
        this.isLoading.set(false); // Marcar como no cargando después de obtener los mensajes

      });
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      this.isLoading.set(false); // marcar como no cargando en caso de error
    }
  }


  // método para cargar más mensajes
  async loadMoreMessages(): Promise<boolean> {
    console.log('loadMoreMessages llamado');
    if (this.isLoading()) { // Si ya se está cargando o no hay más q cargar
      console.log('Carga en proceso.........');
      return false;
    }


    try {
      this.isLoading.set(true); // Marcar como cargando
      const oldLimit = this.currentLimit();
      const newLimit = oldLimit + this.limitPage;

      console.log('Limites:', { old: oldLimit, new: newLimit });
      this.currentLimit.set(newLimit); // Aumentar la cantidad de mensajes a cargar
      await this.loadMessages(); // Cargar mensajes que ya se habrá subido al array

      // comprobar si hay más mensajes para cargar
      const hasMore = this.totalMessages() > newLimit;
      console.log(`¿Hay más mensajes? ${hasMore}`);
      return hasMore; // Devolver true si hay más mensajes, false si no

    } catch (error) {
      console.error('Error al cargar más mensajes', error);

      return false;
    } finally {
      this.isLoading.set(false); // marcar como no cargando tras intentar cargar más mensajes
    }
  }


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
        msgId: messageId,
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
      // Actualizar total de mensajes
      await this.getTotalMessages();
      // this.currentLimit.set(this.limitPage);


      // verificar si hay más mensajes
      const hasMore = this.totalMessages() > this.currentLimit();
      console.log('Message enviado, nuevo total:', {
        total: this.totalMessages(),
        currentLimit: this.currentLimit(),
        hasMore
      });


      return true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
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

  //método para obtener mensajes
  getMessages() {
    return this.messagesArray;
  }
}
