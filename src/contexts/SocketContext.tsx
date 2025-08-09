import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { UserInfo } from '@/services/socket';

interface SocketContextType {
  // Connection state
  isConnected: boolean;
  currentRoom: string | null;
  partner: UserInfo | null;
  availableTalkers: UserInfo[];
  
  // Chat functions
  requestChat: (listenerId: string, talkerId: string) => void;
  joinWaitingQueue: () => void;
  leaveWaitingQueue: () => void;
  sendTextMessage: (text: string) => void;
  sendVoiceMessage: (audioData: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  leaveChat: () => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Event listeners for components
  onTextMessage: (callback: (message: any) => void) => void;
  onVoiceMessage: (callback: (message: any) => void) => void;
  onPartnerTyping: (callback: (data: any) => void) => void;
  onMessageStatus: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};