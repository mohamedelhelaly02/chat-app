import { SocketService } from '../../services/socket-service';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  untracked,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { UserMessage } from '../user-message/user-message';
import { MessageInput } from '../message-input/message-input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TypingIndicator } from '../typing-indicator/typing-indicator';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-chat-area',
  imports: [UserMessage, MessageInput, TypingIndicator],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.css',
})
export class ChatArea implements OnInit {
  private readonly chatService: ChatService = inject(ChatService);
  private readonly authService: AuthService = inject(AuthService);
  protected selectedChatMessages = this.chatService.messages;
  protected isLoadingMessages = this.chatService.isLoadingMessages;
  protected messagesError = this.chatService.messagesError;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly socketService: SocketService = inject(SocketService);
  protected readonly typingUsers = this.chatService.typingUsers;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor() {
    effect(() => {
      const messagesCount = this.selectedChatMessages().length;

      this.scrollToBottom();

      if (messagesCount > 0) {
        untracked(() => {
          this.markRead();
        });
      }
    });
  }

  exitChat() {
    this.chatService.selectedChatId.set('');
    this.chatService.messages.set([]);
  }

  private markRead(): void {
    const chatId = this.chatService.selectedChatId();
    const messages = this.selectedChatMessages();
    const currentUserId = this.authService.currentUser()?._id;

    const hasUnread = messages.some((m) => m.receiver === currentUserId && !m.read);

    if (chatId && hasUnread) {
      this.chatService
        .markMessagesRead(chatId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            const partnerId = this.chatService
              .chats()
              .find((c) => c._id === chatId)
              ?.participants.find((p) => p._id !== currentUserId)?._id;

            this.socketService.emit('user:read_messages', {
              fromUserId: currentUserId,
              toUserId: partnerId,
              chatId,
            });

          },
        });
    }
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

    this.socketService
      .on('user:messages_marked_as_read')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        const { readIds } = data;

        this.chatService.messages.update((allMessages) => {
          return allMessages.map((message) => {
            if (readIds.includes(message._id)) {
              return { ...message, read: true };
            }

            return message;
          });
        });
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
