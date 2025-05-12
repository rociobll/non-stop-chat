import { inject, Injectable, signal } from '@angular/core';
import { Database, onValue, push, query, ref } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { orderByChild } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {

  private db: Database = inject(Database);
  private authService = inject(AuthService);

  private messagesArray = new BehaviorSubject<Message[]>([]); //BEhaviorSub puermite tener el estado actual de los mensajes
 // messagesArray = signal<Message[]>([]); se podría hacer con signal- no necesitaría getMEssages

  constructor() { }

  // Cargar mensajes de FIrebase en tiempo real
  loadMessages() {
    const messagesRef = ref(this.db, 'messages/');
    const messageQuery = query(messagesRef, orderByChild('date'));

    //onValue escucha cualquier cambio en mensajes
    onValue(messageQuery, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach(snapChlid => {
        const message = snapChlid.val(); //obtener valor del mensaje
        message.push({ id: snapChlid.key ?? '', ...message});
      });
      this.messagesArray.next(messages);  //emitir los mensajes asi actualizamos array con los nuevos mensajes
      // this.messagesArray.set(messages);//con signals aqui actualizría la señal de los mensajes
    });
  }

  //método para obtener mensajes como observable-devuelve el estado actual de los mensajes
  getMessages(): Observable<Message[]> {
    return this.messagesArray.asObservable();
  }

  async sendMessage(text:string) {
    const user = await firstValueFrom(this.authService.user$); // obtiene user actual(solo 1 vez sin suscribirme manualmente)
    if(!user || !text) return;

    const now = new Date();

    const newMsg: Message = {
      id: '',
      username: user.displayName || 'desconocido',
      date: Date.now(),
      message: text
    };
    //mandar mensaje a firebase - el id lo debe generar el push
    const messagesRef = ref(this.db, 'messages');
    await push(messagesRef, newMsg); //esperar al envío del mensaje antes de vaciar input
  }

}
