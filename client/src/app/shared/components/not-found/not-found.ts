import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  countdown = signal(10);
  private intervalId: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCountdown() {
    this.intervalId = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.redirectToHome();
      }
    }, 1000);
  }

  redirectToHome() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.router.navigate(['/']);
  }

  goBack() {
    window.history.back();
  }

  suggestions = signal([
    { label: 'الصفحة الرئيسية', route: '/', icon: 'home' },
    { label: 'المحادثات', route: '/chat', icon: 'chat' },
    { label: 'الملف الشخصي', route: '/profile', icon: 'profile' },
    { label: 'المساعدة', route: '/help', icon: 'help' },
  ]);
}
