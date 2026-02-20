import { Component, DestroyRef, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket-service';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly authService: AuthService = inject(AuthService);
  private readonly chatId = this.chatService.selectedChatId;
  private readonly fromUserId = this.authService.currentUser()?._id || '';
  typingTimeout: any;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);


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
      this.chatService.sendTextMessage(this.chatId(), this.messageText)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Message sent successfully:', response);
          this.messageText = '';
        }
      });
    }
  }


  onInput() {
    if (!this.selectedUserId() || this.fromUserId === '') {
      console.warn('No user selected, cannot emit typing status');
      return;
    }

    this.socketService.emit('user:typing', { toUserId: this.selectedUserId(), fromUserId: this.fromUserId, isTyping: true });


    clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
          this.socketService.emit('user:typing', { toUserId: this.selectedUserId(), fromUserId: this.fromUserId, isTyping: false });
    }, 3000);
  }

}
