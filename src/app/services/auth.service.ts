import { inject, Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Inyectar el servicio auth y el router
  private auth = inject(Auth);
  private router = inject(Router);
  //authState() es una función de Firebase que devuelve un Observable que emite el usuario actual o null si no hay
  //se puede usar en componentes con pipe async para saber si hay usuario conectado
  // currentUserObs: Observable<User | null> = authState(this.auth);
  // readonly user$: Observable<User | null> = this.currentUserObs; //user es observable que emite usuario actual autenticado o null y se actualiza automaticamente por el authState

  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    // const cachedUer = localStorage.getItem('user');  ///
    // if(cachedUer)  {
    //   this.userSubject.next(JSON.parse(cachedUer));   ///
    // }

    authState(this.auth).subscribe(user => {
      this.userSubject.next(user);
      if(user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });
  }


  async loginGoogle() {
    try {
      const provider = new GoogleAuthProvider(); // crear proveedor de autenticación de Google

      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(this.auth, provider);
      const user= result.user;

      // localStorage.setItem('user', JSON.stringify(user));

      this.userSubject.next(user);

      console.log('Usuario logueado:', user); // aqui para ver datos usuario

      return { user };

    } catch(error)  {
          console.error('Error al loguearse con Google: ', error);
          throw error;
        }
    }
    // const provider = new GoogleAuthProvider(); // crear proveedor de autenticación de Google

    // provider.setCustomParameters({
    //   prompt: 'select_account'
    // });

    // return signInWithPopup(this.auth, provider)
    //   .then((result: UserCredential) => {
    //     const credential = GoogleAuthProvider.credentialFromResult(result);
    //     const token = credential?.accessToken;
    //     const user = result.user;
    //     // const email =  user.providerData[0]?.email;
    //     console.log('Usuario logueado:', user); // aqui para ver datos usuario

    //     return user; //devuelve datos de usuario

    //   })
    //   .catch((error) => {
    //     console.error('Error al loguearse con Google: ', error);
    //     throw error;
    //   });


  logOut(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        this.router.navigate(['/home-login'])
      })
      .catch((error) => {
        console.error('Error al desloguearse: ', error);
      })
  }

}
