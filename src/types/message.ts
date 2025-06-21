
export interface Message {
  id: string;
  sender: 'listener' | 'talker';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
  audioData?: string; // base64 encoded audio
  duration?: number; // duration in seconds
}
