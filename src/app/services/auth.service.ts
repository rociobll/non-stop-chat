import {
  DestroyRef,
  inject,
  Injectable,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  user: WritableSignal<User | null> = signal(null);

  userInfo = signal<User | null>(null); // signal para almacenar el usuario actual - lo usaré en el guard

  constructor() {
    // authState() devuelve observable que emite el usuario actual
    authState(this.auth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        console.log('Auth State User:', user);
        this.user.set(user); // actualiza BehaviorSubject con  usuario actual
        this.userInfo.set(user);

        user
          ? localStorage.setItem('user', JSON.stringify(user))
          : localStorage.removeItem('user');
      });
  }

  getUser() {
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
    const confirmation = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!confirmation) return;
    try {
      await signOut(this.auth);
      await this.router.navigate(['/home-login']);
    } catch (error) {
      console.error('Error al desloguearse: ', error);
      throw error;
    }
  }
}
