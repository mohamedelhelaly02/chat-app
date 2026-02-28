export interface Message {
  _id: string;
  sender: string;
  receiver: string;
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
