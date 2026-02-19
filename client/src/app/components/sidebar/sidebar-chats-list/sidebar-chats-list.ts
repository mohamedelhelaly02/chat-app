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

    ngOnInit(): void {
        this.chatService.loadChats();
    }

    getOtherParticipant(participants: any[]) {
        return participants.find(p => p._id !== this.authService.currentUser()?._id);
    }

    selectChat(chatId: string): void {
    }
}
