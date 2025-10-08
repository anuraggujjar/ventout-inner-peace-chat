import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { UserInfo, SocketMessage } from '@/services/socket';
import { Message } from '@/types/message';

interface SocketContextType {
  // Connection state
  isConnected: boolean;
  currentRoom: string | null;
  partner: UserInfo | null;
  availableTalkers: UserInfo[];
  messages: Message[];
  partnerTyping: boolean;
  currentConvoId: string | null;
  
  // Chat functions
  requestChat: (talkerId: string) => void;
  joinWaitingQueue: () => void;
  leaveWaitingQueue: () => void;
  sendTextMessage: (text: string) => void;
  sendVoiceMessage: (audioData: string, duration: number) => void;
  startTyping: () => void;
  stopTyping: () => void;
  leaveChat: () => void;
  markMessageAsRead: (messageId: string) => void;
  startLooking: () => void;
  stopLooking: () => void;
  disconnectSocket: () => void;

  // Functions for chat persistence
  setChatSession: (convoId: string, roomId: string) => void;
  clearChatSession: () => void;
  
  // Event listeners for components
  onTextMessage: (callback: (message: SocketMessage) => void) => () => void;
  onPartnerDisconnected: (callback: (data: { roomId: string; reason: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketData = useSocket();

  const value = {
    ...socketData,
  };

  return (
    <SocketContext.Provider value={value}>
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