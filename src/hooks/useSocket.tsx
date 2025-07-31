import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  partnerUserId: string | null;
  isMatched: boolean;
  sendMessage: (message: string) => void;
  sendVoiceMessage: (voiceUrl: string) => void;
  uploadVoiceFile: (audioData: string) => Promise<string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO server
    const newSocket = io('ws://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Register user role
      newSocket.emit('register', {
        userId: user.id,
        role: user.role
      });
      
      toast({
        title: "Connected",
        description: `Searching for a ${user.role === 'talker' ? 'listener' : 'talker'}...`,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      setIsMatched(false);
      setPartnerUserId(null);
    });

    // Handle successful match
    newSocket.on('matched', (data) => {
      console.log('Matched with partner:', data);
      setPartnerUserId(data.partnerUserId);
      setIsMatched(true);
      
      toast({
        title: "Match Found!",
        description: `You've been connected with a ${user.role === 'talker' ? 'listener' : 'talker'}. Start your conversation.`,
      });
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive"
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, toast]);

  const sendMessage = (message: string) => {
    if (socket && partnerUserId && connected) {
      socket.emit('send_message', {
        to: partnerUserId,
        message
      });
    }
  };

  const sendVoiceMessage = (voiceUrl: string) => {
    if (socket && partnerUserId && connected) {
      socket.emit('send_voice', {
        to: partnerUserId,
        url: voiceUrl
      });
    }
  };

  const uploadVoiceFile = async (audioData: string): Promise<string> => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(audioData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      // Create form data
      const formData = new FormData();
      formData.append('voice', blob, 'voice_message.wav');

      // Upload to backend
      const response = await fetch('http://localhost:3000/upload-voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice message');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading voice file:', error);
      throw error;
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      partnerUserId,
      isMatched,
      sendMessage,
      sendVoiceMessage,
      uploadVoiceFile
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};