import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private userInfo = signal<User | null>(null); // signal para almacenar el usuario actual - lo usaré en el guard

  constructor() {

    //se puede usar en componentes con pipe async para saber si hay usuario conectado
    authState(this.auth).subscribe((user) => {
      // authState() devuelve observable que emite el usuario actual
      this.userSubject.next(user); // actualiza BehaviorSubject con  usuario actual
      this.userInfo.set(user);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });
  }
  getUserInfo() {
    return this.userInfo();
  }

  async loginGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      const user = result.user;
      console.log('Usuario logueado:', user);
      await this.router.navigate(['/chat']);
      return user;
    } catch (error) {
      console.error('Error al loguearse con Google: ', error);
      throw error;
    }
  }

  async logOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/home-login']);
    } catch (error) {
      console.error('Error al desloguearse: ', error);
      throw error;
    }
  }
}
