import { io, Socket } from 'socket.io-client';
import { authService } from './auth';

export interface SocketMessage {
  id: string;
  roomId: string;
  senderId: string;
  text?: string;
  audioData?: string;
  timestamp: Date;
  type: 'text' | 'voice';
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatRoom {
  id: string;
  listenerId: string;
  talkerId: string;
  status: 'active' | 'ended';
  createdAt: Date;
}

export interface UserInfo {
  id: string;
  role: 'listener' | 'talker';
  displayName: string;
  isOnline: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      const token = authService.getStoredToken();
      if (!token) {
        reject(new Error('No authentication token found'));
        return;
      }

      // Replace with your backend URL
      const BACKEND_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-backend.com' 
        : 'http://localhost:3000';

      this.socket = io(BACKEND_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Add user to active users list
        this.addUser();
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      // Handle authentication errors
      this.socket.on('auth_error', (error) => {
        console.error('Socket authentication error:', error);
        reject(new Error(error.message || 'Authentication failed'));
      });
    });
  }

  private async addUser() {
    const user = await authService.getStoredUser();
    if (user && this.socket) {
      this.socket.emit('addUser', { userId: user.id });
    }
  }

  // Matchmaking events
  requestChat(listenerId: string, talkerId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('requestChat', { listenerId, talkerId });
  }

  joinWaitingQueue(): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('joinWaitingQueue');
  }

  leaveWaitingQueue(): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('leaveWaitingQueue');
  }

  // Chat events
  sendTextMessage(roomId: string, senderId: string, text: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    
    const message: SocketMessage = {
      id: Date.now().toString(),
      roomId,
      senderId,
      text,
      timestamp: new Date(),
      type: 'text'
    };

    this.socket.emit('textMessage', message);
  }

  sendVoiceMessage(roomId: string, senderId: string, audioData: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    
    const message: SocketMessage = {
      id: Date.now().toString(),
      roomId,
      senderId,
      audioData,
      timestamp: new Date(),
      type: 'voice'
    };

    this.socket.emit('voiceMessage', message);
  }

  markMessageAsRead(messageId: string, roomId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('markAsRead', { messageId, roomId });
  }

  // Typing indicators
  startTyping(roomId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('startTyping', { roomId });
  }

  stopTyping(roomId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('stopTyping', { roomId });
  }

  // Event listeners
  onStartChat(callback: (data: { roomId: string; partner: UserInfo }) => void): void {
    this.socket?.on('startChat', callback);
  }

  onMatchFound(callback: (data: { partner: UserInfo; roomId: string }) => void): void {
    this.socket?.on('matchFound', callback);
  }

  onTextMessage(callback: (message: SocketMessage) => void): void {
    this.socket?.on('textMessage', callback);
  }

  onVoiceMessage(callback: (message: SocketMessage) => void): void {
    this.socket?.on('voiceMessage', callback);
  }

  onPartnerTyping(callback: (data: { isTyping: boolean; roomId: string }) => void): void {
    this.socket?.on('partnerTyping', callback);
  }

  onPartnerDisconnected(callback: (data: { roomId: string; reason: string }) => void): void {
    this.socket?.on('partnerDisconnected', callback);
  }

  onTalkerListUpdate(callback: (talkers: UserInfo[]) => void): void {
    this.socket?.on('talkerListUpdate', callback);
  }

  onMessageStatus(callback: (data: { messageId: string; status: 'delivered' | 'read' }) => void): void {
    this.socket?.on('messageStatus', callback);
  }

  // Room management
  leaveRoom(roomId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('leaveRoom', { roomId });
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  // Getters
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();