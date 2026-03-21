import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { NgClass } from '@angular/common';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user-service';
import { ChatService } from '../../../services/chat-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.html',
  styleUrl: './sidebar-header.css',
  imports: [NgClass],
})
export class SidebarHeader {
  private destroyRef = inject(DestroyRef);

  authService = inject(AuthService);
  private userService = inject(UserService);
  private chatService = inject(ChatService);

  readonly user = input.required<User | null>();

  showUserList = signal(false);
  availableUsers = signal<User[]>([]);
  isLoading = signal(false);
  hasLoadedUsers = signal(false);
  startingChat = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  get usernameInitial(): string {
    return this.user()?.username?.[0]?.toUpperCase() ?? '?';
  }

  get onlineCount(): number {
    return this.availableUsers().filter((u) => u.online).length;
  }

  onNewChat() {
    this.showUserList.update((v) => !v);

    if (this.showUserList()) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .getAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('loading users: ', res.data.users);
          this.availableUsers.set(res.data.users);
          this.hasLoadedUsers.set(true);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load users');
          this.isLoading.set(false);
        },
      });
  }

  startChat(targetUserId: string) {
    this.chatService
      .getOrCreateChat(targetUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showUserList.set(false);
          this.chatService.loadChats();
        },
      });
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (!this.dropdownRef) return;

    if (this.showUserList() && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.showUserList.set(false);
    }
  }
}
