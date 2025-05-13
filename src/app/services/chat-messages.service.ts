import { inject, Injectable, signal } from '@angular/core';
import { Database, onValue, push, query, ref } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { orderByChild, set } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class ChatMessagesService {

  private db: Database = inject(Database);
  private authService = inject(AuthService);

  private messagesArray = new BehaviorSubject<Message[]>([]); //BEhaviorSub permite tener el estado actual de los mensajes
 // messagesArray = signal<Message[]>([]); se podría hacer con signal- no necesitaría getMEssages

  constructor() { }


  // Cargar mensajes de FIrebase en tiempo real
  loadMessages() {
    const messagesRef = ref(this.db, 'chatmessages/');  // con ref se crea una referencia a un nodo (chatmessages) de la bbdd
    const messageQuery = query(messagesRef, orderByChild('date'));   //crea consulta que ordena los mensajes por fecha

    //onValue escucha cualquier cambio en mensajes
    onValue(messageQuery, (snapshot) => {    //recorrer todos los hijos del snaphot mensajes, crea array de objetos MEssage, poniendo la id como hey
      const messages: Message[] = [];
      snapshot.forEach(snapChild => {
        const message = snapChild.val(); //obtener valor del mensaje y añdir nuevo objeto(mensaje) al nodo con su id
        message.push({ id: snapChild.key ?? '', ...message});
      });
      this.messagesArray.next(messages);  //emitir los mensajes asi actualizamos array con los nuevos mensajes
      // this.messagesArray.set(messages);//con signals aqui actualizría la señal de los mensajes
    });
  }

  //método para obtener mensajes como observable-devuelve el estado actual de los mensajes, asi cualquier componente se puede suscribir a mensajes
  getMessages(): Observable<Message[]> {
    return this.messagesArray.asObservable();
  }


  async sendMessage(text:string) {
    const user = await firstValueFrom(this.authService.user$);
    if(!user || !text) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const messagesRef = ref(this.db, 'chatmessages');
    const newMsgRef = push(messagesRef);
    const messageId = newMsgRef.key;

    const newMsg: Message = {   //se crea nuevo objeto Message
      id: messageId,
      username: user.displayName || 'desconocido',
      date: formattedDate,
      message: text
    };
    //mandar mensaje a firebase al nodo chatmessage- el id lo debe generar el push
    // const messagesRef = ref(this.db, 'chatmessages');
    await set(newMsgRef, newMsg);
    console.log('mensaje enviado con éxito');
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
