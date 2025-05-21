import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authHomeLoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/home-login']); // redirige a login si no hay usuario autenticado
        return false; // no permite acceso a ruta /chat
      }

      return true; //si hay user autenticado permite acceso a chat
    }),
  );
};
