import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { UserService } from '../../../../core/services/user-service';
import { AuthUser } from '../../../../shared/models/auth-user.model';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-chat-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-users.html',
  styleUrl: './chat-users.scss',
})
export class ChatUsers {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.data.users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      },
    });
  }
}

