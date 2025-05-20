import { Routes } from '@angular/router';
import { authHomeLoginGuard } from './guards/auth-home-login.guard';

export const routes: Routes = [
  {
    path: 'home-login',
    loadComponent: () =>
      import('./pages/home-login/home-login.page').then((m) => m.HomeLoginPage),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat.page').then((m) => m.ChatPage),
    canActivate: [authHomeLoginGuard],
  },
  {
    path: '',
    redirectTo: 'home-login',
    pathMatch: 'full',
  },
];
