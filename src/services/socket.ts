import { io, Socket } from 'socket.io-client';
import { authService } from './auth';

export interface SocketMessage {
  id: string;
  roomId: string;
  temporaryId?: string;
  senderId: string;
  text?: string;
  audioData?: string;
  createdAt: Date;
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
    private static instance: SocketService;
    private socket: Socket | null = null;
    private isConnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    async connect(): Promise<void> {
        if (this.socket && this.socket.connected) {
            return;
        }

        if (this.isConnecting) {
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (this.socket && this.socket.connected) {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        reject(new Error('Connection attempt failed'));
                    }
                }, 500);
            });
        }

        this.isConnecting = true;

        try {
            const token = await this.getValidToken();
            const storedUser = await authService.getStoredUser();

            if (!token || !storedUser) {
                throw new Error('Authentication failed: No valid token or user found.');
            }

            const BACKEND_URL = 'https://ventoutserver.onrender.com';

            this.socket = io(BACKEND_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            await new Promise<void>((resolve, reject) => {
                this.socket?.once('connect', () => {
                    console.log('Socket connected:', this.socket?.id);
                    this.reconnectAttempts = 0;
                    if (storedUser.id) {
                        this.socket?.emit('addUser', storedUser.id);
                    }
                    resolve();
                });

                this.socket?.once('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    reject(error);
                });
            });
            
            this.setupSocketEventListeners();
            this.isConnecting = false;

        } catch (err) {
            this.isConnecting = false;
            this.disconnect();
            throw err;
        }
    }

    private async getValidToken(): Promise<string | null> {
        try {
            const token = await authService.getToken();
            if (!token) {
                console.log('No token available, attempting to refresh...');
                return await authService.getToken();
            }
            return token;
        } catch (error) {
            console.error('Failed to get valid token:', error);
            return null;
        }
    }

    private setupSocketEventListeners(): void {
        if (!this.socket) return;
        
        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.handleReconnection();
            }
        });

        this.socket.on('connect_error', async (error) => {
            console.error('Socket connection error:', error);
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                console.log('Auth error, attempting to refresh token...');
                try {
                    const newToken = await authService.getToken();
                    if (newToken && this.socket) {
                        this.socket.auth = { token: newToken };
                        this.socket.connect();
                    }
                } catch (authError) {
                    console.error('Failed to refresh token:', authError);
                    authService.logout();
                }
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed after maximum attempts');
            this.handleMaxReconnectAttemptsReached();
        });
    }

    private async handleReconnection(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.handleMaxReconnectAttemptsReached();
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        try {
            const token = await this.getValidToken();
            if (token && this.socket) {
                this.socket.auth = { token };
                this.socket.connect();
            }
        } catch (error) {
            console.error('Reconnection attempt failed:', error);
            setTimeout(() => this.handleReconnection(), 2000 * this.reconnectAttempts);
        }
    }

    private handleMaxReconnectAttemptsReached(): void {
        console.error('Maximum reconnection attempts reached');
        this.disconnect();
        // Optionally trigger logout or show user notification
    }
    
    requestChat(talkerId: string): void {
        if (!this.socket || !this.socket.connected) {
            console.error('Socket not connected, cannot emit requestChat');
            return;
        }
        this.socket.emit('requestChat', { talkerId });
    }
    
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
        }
    }

    joinWaitingQueue(): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('joinWaitingQueue');
    }

    leaveWaitingQueue(): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('leaveWaitingQueue');
    }

    startLooking() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('startLooking');
        }
    }

    stopLooking() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('stopLooking');
        }
    }

    sendTextMessage(roomId: string, senderId: string, text: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        console.log('Sender Id:', senderId);
        this.socket.emit('textMessage', { roomId, senderId, text });
    }

    sendVoiceMessage(roomId: string, senderId: string, audioData: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('voiceMessage', { roomId, senderId, audioData });
    }

    markMessageAsRead(messageId: string, roomId: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('markAsRead', { messageId, roomId });
    }

    startTyping(roomId: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('startTyping', { roomId });
    }

    stopTyping(roomId: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('stopTyping', { roomId });
    }

    onStartChat(callback: (data: { roomId: string; partner: UserInfo; convoId: any }) => void): void {
        this.socket?.on('startChat', callback);
    }

    onMatchFound(callback: (data: { partner: UserInfo; roomId: string }) => void): void {
        this.socket?.on('matchFound', callback);
    }

    onVoiceMessage(callback: (message: SocketMessage) => void): void {
        this.socket?.on('voiceMessage', callback);
    }

    onPartnerTyping(callback: (data: { isTyping: boolean; roomId: string }) => void): void {
        this.socket?.on('partnerTyping', callback);
    }

    onTalkerListUpdate(callback: (talkers: UserInfo[]) => void): void {
        this.socket?.on('talkerListUpdate', callback);
    }

    onMessageStatus(callback: (data: { messageId: string; status: 'delivered' | 'read' }) => void): void {
        this.socket?.on('messageStatus', callback);
    }

    leaveRoom(roomId: string): void {
        if (!this.socket) throw new Error('Socket not connected');
        this.socket.emit('leaveRoom', { roomId });
    }

    public onTextMessage(callback: (message: SocketMessage) => void): void {
        this.socket?.on('textMessage', callback);
    }
    
    public offTextMessage(callback: (message: SocketMessage) => void): void {
        this.socket?.off('textMessage', callback);
    }

    public onPartnerDisconnected(callback: (data: { roomId: string; reason: string }) => void): void {
        this.socket?.on('partnerDisconnected', callback);
    }
    
    public offPartnerDisconnected(callback: (data: { roomId: string; reason: string }) => void): void {
        this.socket?.off('partnerDisconnected', callback);
    }

    public joinRoom(roomId: string): void {
        if (!this.socket) {
            throw new Error('Socket not connected');
        }
        this.socket.emit('joinRoom', { roomId });
    }

    removeAllListeners(): void {
        this.socket?.removeAllListeners();
    }

    get connected(): boolean {
        return this.socket?.connected === true;
    }

    get socketId(): string | undefined {
        return this.socket?.id;
    }
}

export const socketService = SocketService.getInstance();