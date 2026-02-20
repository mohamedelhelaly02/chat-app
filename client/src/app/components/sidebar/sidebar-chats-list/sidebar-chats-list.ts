import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat-service';
import { SocketService } from '../../../services/socket-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth-service';

@Component({
    selector: 'app-sidebar-chats-list',
    imports: [CommonModule],
    templateUrl: './sidebar-chats-list.html',
    styleUrl: './sidebar-chats-list.css',
})
export class SidebarChatsList implements OnInit {
    private readonly chatService = inject(ChatService);
    private readonly socketService = inject(SocketService);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly authService: AuthService = inject(AuthService);

    chats = this.chatService.chats;
    isLoadingChats = this.chatService.isLoadingChats;
    chatsError = this.chatService.chatsError;
    messages = this.chatService.messages;
    isLoadingMessages = this.chatService.isLoadingMessages;
    messagesError = this.chatService.messagesError;

    typingUsers = this.chatService.typingUsers;

    constructor() {
        this.chatService.loadChats();
    }

    ngOnInit(): void {
        this.socketService.on('user:online')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
                this.chatService.updateUserOnlineStatus(data.userId, data.online);
            });

        this.socketService.on('user:statusChanged')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
                this.chatService.updateUserOnlineStatus(data.userId, data.online);
            });

        this.socketService.on('user:typing')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
                this.chatService.setTyping(data.userId, data.isTyping);
            });


        this.socketService.on('chat:updated')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
                const updatedChat = data.chat;
                console.log("Updated Chat: ", updatedChat);
                this.chatService.chats.update((chats) => {
                    const index = chats.findIndex(c => c._id === updatedChat._id);

                    if (index !== -1) {
                        chats[index] = updatedChat;
                    } else {
                        chats.unshift(updatedChat);
                    }
                    return [...chats];
                })
            });
    }

    selectChat(chatId: string): void {
        console.log('Selected chat ID:', chatId);

        const selectedChat = this.chats().find(c => c._id === chatId);

        console.log("Selected chat: ", selectedChat);

        this.chatService.loadMessages(chatId);

        this.socketService.emit('user:chat_opened',
            {
                chatWithUserId: selectedChat?.participants[0]._id,
                userId: this.authService.currentUser()?._id
            });
    }
}
