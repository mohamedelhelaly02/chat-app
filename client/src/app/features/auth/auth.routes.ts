import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((r) => r.Register),
    title: 'Register',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((r) => r.Login),
    title: 'Login',
  },
];
