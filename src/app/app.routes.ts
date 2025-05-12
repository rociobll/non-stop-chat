import { Routes } from '@angular/router';
import { HomeLoginPage } from './pages/home-login/home-login.page';

export const routes: Routes = [
  {
    path: 'home-login',
    loadComponent: () => import('./pages/home-login/home-login.page').then((m) => m.HomeLoginPage),
  },
  {
    path: '**',
    redirectTo: 'home-login',
    pathMatch: 'full',
  },


];
