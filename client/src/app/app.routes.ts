import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'blank',
    loadComponent: () => import('./layouts/blank-layout/blank-layout').then(c => c.BlankLayout),
    children: [
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(c => c.AuthLayout),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'register',
        loadComponent: () => import("./pages/register/register").then(c => c.Register),
        title: 'Register'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((r) => r.Login),
        title: 'Login'
      }
    ]
  }
];
