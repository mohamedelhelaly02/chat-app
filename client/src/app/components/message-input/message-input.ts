import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket-service';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
})
export class MessageInput {

  selectedUserId = input.required<string>();
  placeholderText = input<string>('Type a message...');
  private readonly socketService: SocketService = inject(SocketService);
  private readonly chatService: ChatService = inject(ChatService);
  private readonly chatId = this.chatService.selectedChatId;

  messageText: string = '';

  onKeyPress(event: KeyboardEvent) {
    if (!this.selectedUserId()) {
      console.warn('No user selected, cannot send message');
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('Message sent:', this.messageText);
      console.log('Selected User ID:', this.selectedUserId());
      console.log('Chat ID:', this.chatId());
      this.chatService.sendTextMessage(this.chatId(), this.messageText).subscribe({
        next: (response) => {
          console.log('Message sent successfully:', response);
          this.messageText = '';
          this.socketService.emit('user:typing', { userId: this.selectedUserId(), isTyping: false });
        }
      });
    }
  }


  onInput() {
    if (!this.selectedUserId()) {
      console.warn('No user selected, cannot emit typing status');
      return;
    }

    this.socketService.emit('user:typing', { userId: this.selectedUserId(), isTyping: true });
  }

}
