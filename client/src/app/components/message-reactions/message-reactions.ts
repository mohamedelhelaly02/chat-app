import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { ChatService, ReactionResponseData } from '../../services/chat-service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-reactions',
  imports: [],
  templateUrl: './message-reactions.html',
  styleUrl: './message-reactions.css',
})
export class MessageReactions {
  showDetails = signal(false);
  reactionDetails = signal<ReactionResponseData | null>(null);
  isLoadingReactions = signal(false);
  selectedEmoji = signal<string>('All');

  reactionTabs = computed(() => {
    const summary = (this.reactionDetails()?.summary || {}) as Record<string, number>;
    return Object.entries(summary).map(([emoji, count]) => ({
      emoji,
      count,
    }));
  });

  filteredReactions = computed(() => {
    const reactionDetails = this.reactionDetails();
    if (!reactionDetails) return [];
    if (this.selectedEmoji() === 'All') {
      return reactionDetails.allReactions;
    }
    return reactionDetails.allReactions.filter((r) => r.emoji === this.selectedEmoji());
  });

  selectTab(emoji: string) {
    this.selectedEmoji.set(emoji);
  }

  openReactionDetails(message: Message | undefined) {
    if (message) {
      this.selectedEmoji.set('All');
      this.isLoadingReactions.set(true);
      this.showDetails.set(true);

      this.chatService.getMessageReactions(this.chatId(), this.messageId()).subscribe({
        next: (res) => {
          this.reactionDetails.set(res.data);
          this.isLoadingReactions.set(false);
        },
        error: (err) => {
          console.error('Failed to load reactions', err);
          this.isLoadingReactions.set(false);
        },
      });
    }
  }

  closeDetails() {
    this.showDetails.set(false);
  }

  readonly messageId = input<string>('');
  readonly chatId = input.required<string>();
  readonly isHovered = input.required<boolean>();
  protected showPicker = signal<boolean>(false);
  protected availableEmojis = signal<string[]>(['❤️', '👍', '😂', '😮', '😢', '🙏']);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly chatService: ChatService = inject(ChatService);

  message = computed(() => this.chatService.messages().find((m) => m._id === this.messageId()));
  hasReactions = computed(() => !!this.message()?.reactions?.length);

  togglePicker() {
    console.log('clicked');
    this.showPicker.update((v) => !v);
  }

  selectReaction(emoji: string) {
    this.toggleReaction(emoji);
    this.closePicker();
  }

  toggleReaction(emoji: string) {
    this.chatService.addReaction(this.chatId(), this.messageId(), emoji).subscribe({
      next: (response) => {},
      error: (error) => {},
    });
  }
  closePicker() {
    this.showPicker.set(false);
  }
}
