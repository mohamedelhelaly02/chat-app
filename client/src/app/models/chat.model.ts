import { User } from './user.model';
import { Message } from './message.model';

export interface Chat {
  _id: string;
  participants: User[];
  chatType: 'private' | 'group';
  lastMessage?: Message | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}
