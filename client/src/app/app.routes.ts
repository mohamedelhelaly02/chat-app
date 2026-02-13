import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/blank-layout/blank-layout').then((c) => c.BlankLayout),
    children: [
      { path: '', redirectTo: 'chat', pathMatch: 'full' },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat').then((c) => c.Chat),
        title: 'Chat',
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((c) => c.Register),
        title: 'Register',
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((r) => r.Login),
        title: 'Login',
      },
    ],
  },
];
