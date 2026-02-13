import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthUser } from '../../../models/auth-user.model';

@Component({
  selector: 'app-navbar-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-user-menu.html',
  styleUrl: '../navbar.css',
})
export class NavbarUserMenu {
  user = input.required<AuthUser | null>();
  showDropdown = signal(false);

  toggleDropdown() {
    this.showDropdown.set(!this.showDropdown());
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }
}
