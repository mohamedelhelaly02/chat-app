import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat-service';
import { SocketService } from '../../../services/socket-service';

@Component({
    selector: 'app-sidebar-chats-list',
    imports: [CommonModule],
    templateUrl: './sidebar-chats-list.html',
    styleUrl: './sidebar-chats-list.css',
})
export class SidebarChatsList implements OnInit {
    private readonly chatService = inject(ChatService);
    private readonly socketService = inject(SocketService);

    chats = this.chatService.chats;
    isLoadingChats = this.chatService.isLoadingChats;
    chatsError = this.chatService.chatsError;
    messages = this.chatService.messages;
    isLoadingMessages = this.chatService.isLoadingMessages;
    messagesError = this.chatService.messagesError;

    constructor() {
        this.chatService.loadChats();
    }

    ngOnInit(): void {
        this.socketService.on('user:online').subscribe((data: any) => {
            this.chatService.updateUserOnlineStatus(data.userId, data.online);
        });

        this.socketService.on('user:statusChanged').subscribe((data: any) => {
            this.chatService.updateUserOnlineStatus(data.userId, data.online);
        });
    }

    selectChat(chatId: string): void {
        console.log('Selected chat ID:', chatId);
        this.chatService.loadMessages(chatId);
        console.log('Messages for selected chat:', this.messages());
    }
}
