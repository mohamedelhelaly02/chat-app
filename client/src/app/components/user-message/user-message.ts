import { Component, input } from '@angular/core';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-user-message',
  imports: [],
  templateUrl: './user-message.html',
  styleUrl: './user-message.css',
})
export class UserMessage {
  readonly message = input.required<Message>();
}
