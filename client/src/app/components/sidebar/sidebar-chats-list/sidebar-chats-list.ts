import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat-service';
import { SocketService } from '../../../services/socket-service';
import { AuthService } from '../../../services/auth-service';
import { TypingIndicator } from '../../typing-indicator/typing-indicator';

@Component({
  selector: 'app-sidebar-chats-list',
  imports: [CommonModule, TypingIndicator],
  templateUrl: './sidebar-chats-list.html',
  styleUrl: './sidebar-chats-list.css',
})
export class SidebarChatsList implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly socketService = inject(SocketService);
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
    this.chatService.listenToOnlineUserEvent();
    this.chatService.listenToUserStatusChangedEvent();
    this.chatService.listenToUserTypingEvent();
    this.chatService.listenToChatUpdatedEvent();
    this.chatService.listenToChatUpdatedAfterDeleteMessageEvent();
    this.chatService.listenToUserLoadChatsEvent();
  }

  selectChat(chatId: string): void {
    const selectedChat = this.chats().find((c) => c._id === chatId);
    if (!selectedChat) return;

    const userId = this.authService.currentUser()?._id;
    if (userId) {
      this.chatService.loadMessages(chatId);
      this.chatService.markChatAsReadLocally(chatId, userId);

      this.socketService.emit('user:chat_opened', {
        chatWithUserId: selectedChat?.participants[0]._id,
        userId: userId,
      });
    }
  }
}
