import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { UserMessage } from '../user-message/user-message';
import { MessageInput } from '../message-input/message-input';

@Component({
  selector: 'app-chat-area',
  imports: [UserMessage, MessageInput],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.css',
})
export class ChatArea {

  private readonly chatService: ChatService = inject(ChatService);
  protected selectedChatMessages = this.chatService.messages;
  protected isLoadingMessages = this.chatService.isLoadingMessages;
  protected messagesError = this.chatService.messagesError;

  selectedUserChat() {
    return this.chatService.chats().find(chat => chat._id === this.chatService.selectedChatId())?.participants[0] || null;
  }

  selectedUserId() {
    return this.chatService.chats().find(chat => chat._id === this.chatService.selectedChatId())?.participants[0]._id || '';
  }

}
