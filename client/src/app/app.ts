import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';
import { SocketService } from './services/socket-service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly socketService: SocketService = inject(SocketService);

  async ngOnInit() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.authService.currentUser.set(JSON.parse(user));
      this.authService.token.set(token);

      await this.socketService.connect(token);
    }
  }
}
