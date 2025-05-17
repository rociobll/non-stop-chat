import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const authHomeLoginGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);


  if (!authService.getUserInfo()) { // Si el usuario no está autenticado, permitir la navegación
    console.log('Usuario no autenticado. Redirigiendo a página de Login');
    router.navigate(['/home-login']);
    return false; // Bloquear la navegación a la ruta actual

  }
  return true; // si autenticado permitir navegación a la ruta actual
};
