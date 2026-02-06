import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat.routes').then((r) => r.CHAT_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  { path: '**', component: NotFound, title: '404 not found' },
];
