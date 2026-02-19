import { Component, inject } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ChatArea } from '../../components/chat-area/chat-area';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat',
  imports: [Sidebar, ChatArea],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private readonly chatService: ChatService = inject(ChatService);
  protected selectedChatId = this.chatService.selectedChatId;

}
