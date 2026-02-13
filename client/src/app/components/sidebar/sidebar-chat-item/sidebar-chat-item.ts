import { Component, Input, input } from '@angular/core';

@Component({
    selector: 'app-sidebar-chat-item',
    imports: [],
    templateUrl: './sidebar-chat-item.html',
    styleUrl: './sidebar-chat-item.css',
})
export class SidebarChatItem {
    readonly name = input<string>('');
    readonly avatar = input<string>('');
    readonly time = input<string>('');
    readonly unreadCount = input<number>(0);
    readonly isActive = input<boolean>(false);
}
