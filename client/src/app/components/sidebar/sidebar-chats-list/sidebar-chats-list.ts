import { Component } from '@angular/core';
import { SidebarChatItem } from '../sidebar-chat-item/sidebar-chat-item';

@Component({
    selector: 'app-sidebar-chats-list',
    imports: [SidebarChatItem],
    templateUrl: './sidebar-chats-list.html',
    styleUrl: './sidebar-chats-list.css',
})
export class SidebarChatsList { }
