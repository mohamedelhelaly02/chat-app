import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';
import { SocketService } from './socket-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ChatDataResponse {
  chat: Chat;
}

interface ChatsDataResponse {
  chats: Chat[];
}

interface MessagesDataResponse {
  messages: Message[];
}

interface ChatResponse {
  status: string;
  data: ChatDataResponse;
}

interface ChatsResponse {
  status: string;
  data: ChatsDataResponse;
}

interface MessagesResponse {
  status: string;
  data: MessagesDataResponse;
}

interface MessageResponse {
  status: string;
  data: {
    message: Message;
  };
}

interface DeleteMessageResponse {
  status: string;
  message: string;
}

type markReadResponse = { status: string; data: { modifiedCount: number; message: string } };

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  readonly BASE_URL: string = 'http://localhost:4000/api/v1/chats';
  private readonly httpClient = inject(HttpClient);
  private readonly socketService = inject(SocketService);
  private readonly destroyRef = inject(DestroyRef);

  chats: WritableSignal<Chat[]> = signal<Chat[]>([]);
  messages: WritableSignal<Message[]> = signal<Message[]>([]);
  isLoadingChats: WritableSignal<boolean> = signal<boolean>(false);
  isLoadingMessages: WritableSignal<boolean> = signal<boolean>(false);
  chatsError: WritableSignal<string | null> = signal<string | null>(null);
  messagesError: WritableSignal<string | null> = signal<string | null>(null);
  selectedChatId: WritableSignal<string> = signal<string>('');
  typingUsers: WritableSignal<Set<string>> = signal<Set<string>>(new Set());
  isRecording: WritableSignal<boolean> = signal<boolean>(false);

  resetChatState(): void {
    this.chats.set([]);
    this.messages.set([]);
    this.isLoadingChats.set(false);
    this.isLoadingMessages.set(false);
    this.chatsError.set(null);
    this.messagesError.set(null);
    this.selectedChatId.set('');
    this.typingUsers.set(new Set<string>());
  }

  markChatAsReadLocally(chatId: string, userId: string): void {
    this.chats.update((allChats) =>
      allChats.map((chat) => {
        if (chat._id === chatId) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      }),
    );
  }

  listenToUserLoadChatsEvent(): void {
    this.socketService
      .on('user:load_user_chats')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.loadChats();
      });
  }

  listenToReadEvents() {
    this.socketService
      .on('user:messages_read')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        if (data.chatId !== this.selectedChatId()) return;

        this.messages.update((allMessages) =>
          allMessages.map((message) =>
            data.readIds.includes(message._id) ? { ...message, read: true } : message,
          ),
        );

        this.socketService.emit('user:seen_messages', {
          chatWithUserId: data.chatWithUserId,
          readBy: data.readBy,
        });
      });
  }

  listenToOnlineUserEvent(): void {
    this.socketService
      .on('user:online')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.updateUserOnlineStatus(data.userId, data.online);
      });
  }

  listenToUserStatusChangedEvent(): void {
    this.socketService
      .on('user:statusChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.updateUserOnlineStatus(data.userId, data.online);
      });
  }

  listenToUserTypingEvent(): void {
    this.socketService
      .on('user:typing')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.setTyping(data.userId, data.isTyping);
      });
  }

  listenToChatUpdatedEvent(): void {
    this.socketService
      .on('chat:updated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        const updatedChat = data.chat;
        console.log('Updated Chat: ', updatedChat);
        this.chats.update((chats) => {
          const index = chats.findIndex((c) => c._id === updatedChat._id);

          if (index !== -1) {
            chats[index] = updatedChat;
          } else {
            chats.unshift(updatedChat);
          }
          return [...chats];
        });
      });
  }

  listenToDeliveredMessageEvent(): void {
    this.socketService
      .on('user:message_delivered')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        if (this.selectedChatId() !== data.chatId) return;
        this.messages.update((allMessages) =>
          allMessages.map((message) =>
            message._id === data.messageId ? { ...message, delivered: true } : message,
          ),
        );
      });
  }

  private setTyping(fromUserId: string, isTyping: boolean) {
    if (!fromUserId) {
      return;
    }

    const updated = new Set(this.typingUsers());
    if (isTyping) {
      updated.add(fromUserId);
    } else {
      updated.delete(fromUserId);
    }

    this.typingUsers.set(updated);
  }

  markMessagesRead(chatId: string): Observable<markReadResponse> {
    return this.httpClient
      .post<markReadResponse>(`${this.BASE_URL}/${chatId}/messages/read`, null)
      .pipe(
        tap(() => {
          this.chats.update((prevChats) =>
            prevChats.map((chat) => (chat._id === chatId ? { ...chat, unreadCount: 0 } : chat)),
          );
        }),
      );
  }

  getOrCreateChat(userId: string): Observable<ChatResponse> {
    return this.httpClient.post<ChatResponse>(this.BASE_URL, { userId });
  }

  loadChats(): void {
    this.isLoadingChats.set(true);
    this.chatsError.set(null);

    this.httpClient.get<ChatsResponse>(this.BASE_URL).subscribe({
      next: (response) => {
        this.chats.set(response.data.chats);
        this.isLoadingChats.set(false);
      },
      error: () => {
        this.chatsError.set('تعذر تحميل المحادثات.');
        this.isLoadingChats.set(false);
      },
    });
  }

  getMessages(chatId: string): Observable<MessagesResponse> {
    this.selectedChatId.set(chatId);
    return this.httpClient.get<MessagesResponse>(`${this.BASE_URL}/${chatId}/messages`).pipe(
      tap((response) => {
        console.log("api: ", response.data.messages);
        this.messages.set(response.data.messages);
      }),
    );
  }

  loadMessages(chatId: string): void {
    this.isLoadingMessages.set(true);
    this.messagesError.set(null);

    this.getMessages(chatId).subscribe({
      next: () => {
        this.isLoadingMessages.set(false);
      },
      error: () => {
        this.messagesError.set('تعذر تحميل الرسائل.');
        this.isLoadingMessages.set(false);
      },
    });
  }

  sendTextMessage(chatId: string, content: string): Observable<MessageResponse> {
    return this.httpClient
      .post<MessageResponse>(`${this.BASE_URL}/${chatId}/messages`, { content })
      .pipe(
        tap((response) => {
          this.messages.update((prev) => [...prev, response.data.message]);
        }),
      );
  }

  sendVoiceMessage(receiverId: string, duration: number, audio: Blob): Observable<MessageResponse> {
    const formData = new FormData();
    formData.append('voice', audio, 'voice.webm');
    formData.append('receiverId', receiverId);
    formData.append('duration', duration.toString());

    return this.httpClient.post<MessageResponse>(`${this.BASE_URL}/messages/voice`, formData).pipe(
      tap((response) => {
        this.messages.update((prev) => [...prev, response.data.message]);
      }),
    );
  }

  deleteMessage(messageId: string): Observable<DeleteMessageResponse> {
    return this.httpClient.delete<DeleteMessageResponse>(`${this.BASE_URL}/messages/${messageId}`);
  }

  private upsertChat(existing: Chat[], incoming: Chat): Chat[] {
    const index = existing.findIndex((chat) => chat._id === incoming._id);
    if (index === -1) {
      return [incoming, ...existing];
    }

    const next = [...existing];
    next[index] = incoming;
    return next;
  }

  private updateUserOnlineStatus(userId: string, online: boolean) {
    console.log(`Updating online status for user ${userId} to ${online}`);
    return this.chats.update((prev) => {
      return prev.map((chat) => {
        const updatedUsers = chat.participants.map((p) => {
          if (p._id === userId) {
            return { ...p, online };
          }
          return p;
        });
        return { ...chat, participants: updatedUsers };
      });
    });
  }

  updateUserTypingStatus(userId: string, isTyping: boolean) {
    console.log(`Updating typing status for user ${userId} to ${isTyping}`);
    return this.chats.update((prev) => {
      return prev.map((chat) => {
        const updatedUsers = chat.participants.map((p) => {
          if (p._id === userId) {
            return { ...p, isTyping };
          }
          return p;
        });
        return { ...chat, participants: updatedUsers };
      });
    });
  }
}
