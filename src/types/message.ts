
export interface Message {
  id: string;
  sender: 'listener' | 'talker' | string;
  senderId?: string;
  content: string;
  timestamp: Date;
  createdAt?: Date;
  type: 'text' | 'voice';
  audioData?: string; // base64 encoded audio
  duration?: number; // duration in seconds
  status?: 'sent' | 'delivered' | 'read';
}
