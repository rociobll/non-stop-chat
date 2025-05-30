import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authHomeLoginGuard: CanActivateFn = (route, state) => {
  const { user } = inject(AuthService);
  const router = inject(Router);

  if (!user()) {
    router.navigate(['/home-login']);
    return false; // no permite acceso a /chat
  }

  return true;
};
