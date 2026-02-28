import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';
import { SocketService } from './services/socket-service';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly socketService: SocketService = inject(SocketService);
  private readonly router = inject(Router);

  async ngOnInit() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const isTokenValid = this.checkTokenStatus(token);

        if (isTokenValid) {
          this.authService.currentUser.set(JSON.parse(user));
          this.authService.token.set(token);
          await this.socketService.connect(token);
        } else {
          this.handleLogout();
        }
      } catch (error) {
        this.handleLogout();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.currentUser.set(null);
    this.authService.token.set(null);
    this.socketService.disconnect();
    this.router.navigate(['/login']);
  }

  private checkTokenStatus(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);

      const expirationTime = decodedToken.exp * 1000;

      const currentTime = Date.now();

      return currentTime < expirationTime;
    } catch (error) {
      return false;
    }
  }
}
