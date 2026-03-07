import { Component, DestroyRef, inject, input, OnDestroy, signal } from '@angular/core';
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
export class MessageInput implements OnDestroy {
  cancelRecording() {
    this.stopRecording(false);
  }
  selectedUserId = input.required<string>();
  placeholderText = input<string>('Type a message...');
  typingTimeout: any;
  recordingTimeout: any;
  messageText: string = '';

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  recordingStartTime = 0;
  recordingTime = '00:00';
  private recordingInterval: any;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  waveformBars = signal<number[]>(new Array(30).fill(5));

  private readonly socketService: SocketService = inject(SocketService);
  private readonly chatService: ChatService = inject(ChatService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly chatId = this.chatService.selectedChatId;
  private readonly fromUserId = this.authService.currentUser()?._id || '';
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  isRecording = this.chatService.isRecording;

  canSend() {
    return this.messageText !== '' && this.selectedUserId();
  }

  async toggleRecording(): Promise<void> {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording(): Promise<void> {
    try {
      this.socketService.emit('user:recording', {
        toUserId: this.selectedUserId(),
        fromUserId: this.fromUserId,
        recording: true,
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.recordingStartTime = Date.now();
      this.recordingTime = '00:00';

      this.chatService.isRecording.set(true);

      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();

      this.initWaveform(stream);

      this.updateRecordingTime();
    } catch (error) {
      console.error(`Can not access mic: ${error}`);
    }
  }
  initWaveform(stream: MediaStream) {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    const source = this.audioCtx.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.analyser.fftSize = 64;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateBars = () => {
      if (!this.isRecording()) return;

      this.analyser?.getByteFrequencyData(dataArray);

      const newBars = Array.from(dataArray.slice(0, 30)).map((val) => {
        return Math.max(5, (val / 255) * 35);
      });

      this.waveformBars.set(newBars);

      this.animationFrameId = requestAnimationFrame(updateBars);
    };

    updateBars();
  }

  private updateRecordingTime(): void {
    if (!this.chatService.isRecording()) return;

    const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    this.recordingTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this.recordingInterval = setTimeout(() => this.updateRecordingTime(), 1000);
  }

  stopRecording(shouldSend: boolean = true) {
    if (!this.mediaRecorder || !this.chatService.isRecording()) return;

    this.chatService.isRecording.set(false);

    clearTimeout(this.recordingTimeout);

    this.recordingTimeout = setTimeout(() => {
      this.socketService.emit('user:recording', {
        toUserId: this.selectedUserId(),
        fromUserId: this.fromUserId,
        recording: false,
      });
    }, 1000);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recordingInterval) {
      clearTimeout(this.recordingInterval);
      this.recordingInterval = null;
    }

    this.waveformBars.set(new Array(30).fill(5));
    this.recordingTime = '00:00';

    this.mediaRecorder.onstop = () => {
      if (shouldSend) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);

        this.sendVoiceMessage(audioBlob, duration);
      }

      this.audioChunks = [];
    };

    this.mediaRecorder.stop();
    this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());

    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.analyser = null;
    }

    this.mediaRecorder = null;
  }

  onKeyPress(event: KeyboardEvent) {
    if (!this.selectedUserId()) {
      return;
    }

    this.socketService.emit('user:typing', {
      toUserId: this.selectedUserId(),
      fromUserId: this.fromUserId,
      isTyping: true,
    });

    clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
      this.socketService.emit('user:typing', {
        toUserId: this.selectedUserId(),
        fromUserId: this.fromUserId,
        isTyping: false,
      });
    }, 1000);

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    this.chatService
      .sendTextMessage(this.chatId(), this.messageText)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.messageText = '';

          this.socketService.emit('user:new_message', {
            toUserId: this.selectedUserId(),
            fromUserId: this.fromUserId,
            message: response.data.message,
          });
        },
      });
  }

  private sendVoiceMessage(audioBlob: Blob, duration: number): void {
    if (!this.selectedUserId()) return;

    this.chatService
      .sendVoiceMessage(this.selectedUserId(), duration, audioBlob)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error('Error sending voice message:', error);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.isRecording()) {
      this.stopRecording(false);
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
}
