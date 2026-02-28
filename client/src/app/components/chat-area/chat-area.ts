import { SocketService } from '../../services/socket-service';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { UserMessage } from '../user-message/user-message';
import { MessageInput } from '../message-input/message-input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TypingIndicator } from '../typing-indicator/typing-indicator';

@Component({
  selector: 'app-chat-area',
  imports: [UserMessage, MessageInput, TypingIndicator],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.css',
})
export class ChatArea implements OnInit {
  private readonly chatService: ChatService = inject(ChatService);
  protected selectedChatMessages = this.chatService.messages;
  protected isLoadingMessages = this.chatService.isLoadingMessages;
  protected messagesError = this.chatService.messagesError;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly socketService: SocketService = inject(SocketService);
  protected readonly typingUsers = this.chatService.typingUsers;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor() {
    effect(() => {
      // needs to marked as seen to server
      const messages = this.selectedChatMessages();
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngOnInit(): void {
    this.socketService
      .on('chat:message-received')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        const chat = this.chatService.chats().find((c) => c._id === data.chatId);
        if (!chat) return;
        this.chatService.messages.update((prev) => [...prev, data.message]);
      });
  }

  selectedUserChat() {
    return (
      this.chatService.chats().find((chat) => chat._id === this.chatService.selectedChatId())
        ?.participants[0] || null
    );
  }

  selectedUserId() {
    return (
      this.chatService.chats().find((chat) => chat._id === this.chatService.selectedChatId())
        ?.participants[0]._id || ''
    );
  }

  get UsernameUpperedCase() {
    return this.selectedUserChat()?.username[0].toUpperCase();
  }
}
