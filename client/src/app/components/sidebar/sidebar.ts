import { Component, inject } from '@angular/core';
import { SidebarHeader } from './sidebar-header/sidebar-header';
import { SidebarSearch } from './sidebar-search/sidebar-search';
import { SidebarChatsList } from './sidebar-chats-list/sidebar-chats-list';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarHeader, SidebarSearch, SidebarChatsList],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);
}
