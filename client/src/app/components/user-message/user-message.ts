import { Message } from './../../models/message.model';
import { Component, inject, input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-user-message',
  imports: [DatePipe],
  templateUrl: './user-message.html',
  styleUrl: './user-message.css',
})
export class UserMessage implements OnInit {
  readonly message = input.required<Message>();
  private readonly authService: AuthService = inject(AuthService);
  private readonly currentUserId = this.authService.currentUser()?._id;
  private readonly chatService = inject(ChatService);

  ngOnInit(): void {
    this.chatService.listenToReadEvents();
  }

  isMine() {
    return this.message().sender._id === this.currentUserId;
  }
}
