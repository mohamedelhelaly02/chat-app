import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth-service';
import { SocketService } from '../../../services/socket-service';

@Component({
  selector: 'app-navbar-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-user-menu.html',
  styleUrl: '../navbar.css',
})
export class NavbarUserMenu {
  authService = inject(AuthService);
  user = input.required<User | null>();
  showDropdown = signal(false);
  private readonly socketService = inject(SocketService);

  toggleDropdown() {
    this.showDropdown.set(!this.showDropdown());
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  logout() {
    const loggedInUserId = this.authService.currentUser()?._id;

    this.socketService.emit('user:logout', { userId: loggedInUserId });

    this.socketService.disconnect();

    this.authService.logout().subscribe(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      this.authService.currentUser.set(null);
      this.authService.token.set(null);
    });
  }
}
