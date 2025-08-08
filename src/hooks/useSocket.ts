import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socketService, SocketMessage, UserInfo } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [partner, setPartner] = useState<UserInfo | null>(null);
  const [availableTalkers, setAvailableTalkers] = useState<UserInfo[]>([]);
  const connectionPromise = useRef<Promise<void> | null>(null);

  // Connect to socket when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !connectionPromise.current) {
      connectionPromise.current = connectSocket();
    }

    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
        connectionPromise.current = null;
      }
    };
  }, [isAuthenticated, user]);

  const connectSocket = async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      setupEventListeners();
      
      toast({
        title: "Connected",
        description: "You're now online and ready to chat",
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      setIsConnected(false);
      
      toast({
        title: "Connection Failed",
        description: "Unable to connect to chat service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const disconnectSocket = () => {
    socketService.removeAllListeners();
    socketService.disconnect();
    setIsConnected(false);
    setCurrentRoom(null);
    setPartner(null);
    setAvailableTalkers([]);
  };

  const setupEventListeners = () => {
    // Match found (for talkers)
    socketService.onMatchFound(({ partner: matchedPartner, roomId }) => {
      console.log('Match found:', { partner: matchedPartner, roomId });
      setCurrentRoom(roomId);
      setPartner(matchedPartner);
      
      toast({
        title: "Match Found!",
        description: `Connected with a ${matchedPartner.role}`,
      });
    });

    // Chat started (for listeners)
    socketService.onStartChat(({ roomId, partner: chatPartner }) => {
      console.log('Chat started:', { roomId, partner: chatPartner });
      setCurrentRoom(roomId);
      setPartner(chatPartner);
      
      toast({
        title: "Chat Started",
        description: `Now chatting with a ${chatPartner.role}`,
      });
    });

    // Partner disconnected
    socketService.onPartnerDisconnected(({ roomId, reason }) => {
      console.log('Partner disconnected:', { roomId, reason });
      
      if (roomId === currentRoom) {
        setCurrentRoom(null);
        setPartner(null);
        
        toast({
          title: "Partner Disconnected",
          description: "The conversation has ended. You can start a new one.",
          variant: "destructive"
        });
      }
    });

    // Available talkers list (for listeners)
    socketService.onTalkerListUpdate((talkers) => {
      console.log('Talker list updated:', talkers);
      setAvailableTalkers(talkers);
    });
  };

  // Chat functions
  const requestChat = (listenerId: string, talkerId: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please wait for connection to be established",
        variant: "destructive"
      });
      return;
    }
    socketService.requestChat(listenerId, talkerId);
  };

  const joinWaitingQueue = () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please wait for connection to be established",
        variant: "destructive"
      });
      return;
    }
    socketService.joinWaitingQueue();
  };

  const leaveWaitingQueue = () => {
    if (isConnected) {
      socketService.leaveWaitingQueue();
    }
  };

  const sendTextMessage = (text: string) => {
    if (!currentRoom || !user) {
      throw new Error('No active chat room or user not authenticated');
    }
    socketService.sendTextMessage(currentRoom, user.id, text);
  };

  const sendVoiceMessage = (audioData: string) => {
    if (!currentRoom || !user) {
      throw new Error('No active chat room or user not authenticated');
    }
    socketService.sendVoiceMessage(currentRoom, user.id, audioData);
  };

  const startTyping = () => {
    if (currentRoom && isConnected) {
      socketService.startTyping(currentRoom);
    }
  };

  const stopTyping = () => {
    if (currentRoom && isConnected) {
      socketService.stopTyping(currentRoom);
    }
  };

  const leaveChat = () => {
    if (currentRoom) {
      socketService.leaveRoom(currentRoom);
      setCurrentRoom(null);
      setPartner(null);
    }
  };

  const markMessageAsRead = (messageId: string) => {
    if (currentRoom) {
      socketService.markMessageAsRead(messageId, currentRoom);
    }
  };

  return {
    // Connection state
    isConnected,
    currentRoom,
    partner,
    availableTalkers,
    
    // Chat functions
    requestChat,
    joinWaitingQueue,
    leaveWaitingQueue,
    sendTextMessage,
    sendVoiceMessage,
    startTyping,
    stopTyping,
    leaveChat,
    markMessageAsRead,
    
    // Event listeners for components
    onTextMessage: socketService.onTextMessage.bind(socketService),
    onVoiceMessage: socketService.onVoiceMessage.bind(socketService),
    onPartnerTyping: socketService.onPartnerTyping.bind(socketService),
    onMessageStatus: socketService.onMessageStatus.bind(socketService),
  };
};