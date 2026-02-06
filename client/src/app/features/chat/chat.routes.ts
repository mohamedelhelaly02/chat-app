import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-users/chat-users').then((c) => c.ChatUsers),
    title: 'User chat list',
  },
  {
    path: ':chatId',
    loadComponent: () => import('./pages/chat/chat').then((c) => c.Chat),
    title: 'Chat'
  }
];

