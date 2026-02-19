import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth-service';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';

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

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  readonly BASE_URL: string = 'http://localhost:4000/api/v1/chats';
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);

  chats: WritableSignal<Chat[]> = signal<Chat[]>([]);
  messages: WritableSignal<Message[]> = signal<Message[]>([]);
  isLoadingChats: WritableSignal<boolean> = signal<boolean>(false);
  isLoadingMessages: WritableSignal<boolean> = signal<boolean>(false);
  chatsError: WritableSignal<string | null> = signal<string | null>(null);
  messagesError: WritableSignal<string | null> = signal<string | null>(null);
  selectedChatId: WritableSignal<string> = signal<string>('');

  getOrCreateChat(userId: string): Observable<ChatResponse> {
    return this.httpClient
      .post<ChatResponse>(
        this.BASE_URL,
        { userId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap((response) => {
          const chat = response.data.chat;
          this.chats.update((prev) => this.upsertChat(prev, chat));
        })
      );
  }

  loadChats(): void {
    this.isLoadingChats.set(true);
    this.chatsError.set(null);

    this.httpClient
      .get<ChatsResponse>(this.BASE_URL, { headers: this.getAuthHeaders() })
      .subscribe({
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
    return this.httpClient
      .get<MessagesResponse>(`${this.BASE_URL}/${chatId}/messages`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          this.messages.set(response.data.messages);
        })
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
      .post<MessageResponse>(
        `${this.BASE_URL}/${chatId}/messages`,
        { content },
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap((response) => {
          this.messages.update((prev) => [...prev, response.data.message]);
        })
      );
  }

  deleteMessage(messageId: string): Observable<DeleteMessageResponse> {
    return this.httpClient.delete<DeleteMessageResponse>(
      `${this.BASE_URL}/messages/${messageId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders().set('Authorization', `Bearer ${token ?? ''}`);
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
}
