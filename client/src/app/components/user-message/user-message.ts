import { Message } from './../../models/message.model';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-user-message',
  imports: [DatePipe],
  templateUrl: './user-message.html',
  styleUrl: './user-message.css',
})
export class UserMessage implements OnInit {
  readonly message = input.required<Message>();
  private readonly authService: AuthService = inject(AuthService);
  private readonly currentUserId = this.authService.currentUser()?._id;
  private readonly chatService = inject(ChatService);

  private currentAudio: HTMLAudioElement | null = null;
  activeMessageId = signal<string | null>(null);
  audioProgress = signal<number>(0);

  ngOnInit(): void {
    this.chatService.listenToReadEvents();
    this.chatService.listenToDeliveredMessageEvent();
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
}
