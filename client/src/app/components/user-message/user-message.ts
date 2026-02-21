import { Component, inject, input } from '@angular/core';
import { Message } from '../../models/message.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-user-message',
  imports: [],
  templateUrl: './user-message.html',
  styleUrl: './user-message.css',
})
export class UserMessage {
  readonly message = input.required<Message>();
  private readonly authService: AuthService = inject(AuthService);
  private readonly currentUserId = this.authService.currentUser()?._id;


  isMine() {
    return this.message().sender._id === this.currentUserId;
  }

}
