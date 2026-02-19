import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chat-area',
  imports: [NgClass],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.css',
})
export class ChatArea {
  private readonly chatService: ChatService = inject(ChatService);
  protected selectedChatMessages = this.chatService.messages;
  protected isLoadingMessages = this.chatService.isLoadingMessages;
  protected messagesError = this.chatService.messagesError;
}
