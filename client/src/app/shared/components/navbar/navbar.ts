import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnDestroy {
  menuToggle = output<void>();
  readonly authService = inject(AuthService);
  logoutSubscription!: Subscription;

  showUserMenu = signal(false);
  showNotifications = signal(false);
  notificationCount = signal(3);

  notifications = signal([
    {
      id: '1',
      type: 'message',
      title: 'رسالة جديدة من Wade Warren',
      message: 'See you tomorrow!',
      time: 'منذ 5 دقائق',
      read: false,
    },
    {
      id: '2',
      type: 'mention',
      title: 'تم الإشارة إليك في محادثة',
      message: 'Jane Cooper mentioned you in a chat',
      time: 'منذ 10 دقائق',
      read: false,
    },
    {
      id: '3',
      type: 'system',
      title: 'تحديث النظام',
      message: 'New features available!',
      time: 'منذ ساعة',
      read: true,
    },
  ]);


  toggleUserMenu() {
    this.showUserMenu.update((value) => !value);
    this.showNotifications.set(false);
  }

  toggleNotifications() {
    this.showNotifications.update((value) => !value);
    this.showUserMenu.set(false);
  }

  closeMenus() {
    this.showUserMenu.set(false);
    this.showNotifications.set(false);
  }

  onLogout() {
    this.logoutSubscription = this.authService.logout().subscribe();
  }

  markAllAsRead() {
    this.notifications.update((notifs) => notifs.map((n) => ({ ...n, read: true })));
    this.notificationCount.set(0);
  }

  onMenuToggle() {
    this.menuToggle.emit();
  }

  ngOnDestroy(): void {
    this.logoutSubscription.unsubscribe();
  }

}
