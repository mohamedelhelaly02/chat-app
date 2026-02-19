import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat-service';
import { AuthService } from '../../../services/auth-service';

@Component({
    selector: 'app-sidebar-chats-list',
    imports: [CommonModule],
    templateUrl: './sidebar-chats-list.html',
    styleUrl: './sidebar-chats-list.css',
})
export class SidebarChatsList implements OnInit {
    private readonly chatService = inject(ChatService);
    private readonly authService = inject(AuthService);
    chats = this.chatService.chats;
    isLoadingChats = this.chatService.isLoadingChats;
    chatsError = this.chatService.chatsError;
    messages = this.chatService.messages;
    isLoadingMessages = this.chatService.isLoadingMessages;
    messagesError = this.chatService.messagesError;

    ngOnInit(): void {
        this.chatService.loadChats();
    }

    selectChat(chatId: string): void {
        console.log('Selected chat ID:', chatId);
        this.chatService.loadMessages(chatId);
        console.log('Messages for selected chat:', this.messages());
    }
}
