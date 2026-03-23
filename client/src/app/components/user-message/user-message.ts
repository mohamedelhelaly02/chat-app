import { Message } from './../../models/message.model';
import { Component, DestroyRef, HostListener, inject, input, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../services/socket-service';
import { MessageReactions } from '../message-reactions/message-reactions';

@Component({
  selector: 'app-user-message',
  imports: [DatePipe, MessageReactions],
  templateUrl: './user-message.html',
  styleUrl: './user-message.css',
})
export class UserMessage implements OnInit {
  readonly message = input.required<Message>();
  private readonly authService: AuthService = inject(AuthService);
  private readonly currentUserId = this.authService.currentUser()?._id;
  private readonly chatService = inject(ChatService);
  private readonly socketService = inject(SocketService);
  private readonly destroyRef = inject(DestroyRef);

  private currentAudio: HTMLAudioElement | null = null;
  activeMessageId = signal<string | null>(null);
  audioProgress = signal<number>(0);
  protected isHovered = signal<boolean>(false);

  ngOnInit(): void {
    this.chatService.listenToReadEvents();
    this.chatService.listenToDeliveredMessageEvent();
    this.chatService.listenToMessageReactionsEvent();
  }

  isMine() {
    return this.message().sender === this.currentUserId;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  toggleVoice(voiceMessage: Message) {
    if (this.activeMessageId() === voiceMessage._id && this.currentAudio) {
      if (this.currentAudio.paused) {
        this.currentAudio.play();
      } else {
        this.currentAudio.pause();
      }

      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const audioUrl = `http://localhost:4000${voiceMessage.voiceUrl}`;
    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    this.activeMessageId.set(voiceMessage._id);

    audio.play();

    audio.ontimeupdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      this.audioProgress.set(progress);
    };

    audio.onended = () => {
      this.activeMessageId.set(null);
      this.audioProgress.set(0);
      this.currentAudio = null;
    };
  }

  isPlaying(message: Message) {
    return this.activeMessageId() === message._id && !this.currentAudio?.paused;
  }

  onDeleteMessage() {
    if (confirm('Are you sure to delete this message ?')) {
      this.chatService
        .deleteMessage(this.message()._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            console.log(response);
            this.socketService.emit('user:message_deleted', {
              messageId: response.data.messageId,
              toUserId: this.message().receiver,
              fromUserId: this.authService.currentUser()?._id,
            });
          },
        });
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    console.log('Hovered');
    this.isHovered.set(true);
  }

  @HostListener('mouseleave')
  onMouseLeaved() {
    console.log('Leaved');

    this.isHovered.set(false);
  }
}
