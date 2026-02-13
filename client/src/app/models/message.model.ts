import { User } from './user.model';

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  chat: string;
  messageType: 'text' | 'voice';
  content?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  delivered: boolean;
  deliveredAt?: string;
  read: boolean;
  readAt?: string;
  deleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
