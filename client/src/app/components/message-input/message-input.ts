import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
})
export class MessageInput {

  selectedUserId = input.required<string>();
  placeholderText = input<string>('Type a message...');

  messageText: string = '';

  onKeyPress(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('Message sent:', this.messageText);
    }
  }
}
