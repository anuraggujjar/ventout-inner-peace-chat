
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import WaitingForMatch from '@/components/chat/WaitingForMatch';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSocketContext } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput } from '@/utils/privacy';
import { Message } from '@/types/message';
import { UserInfo, SocketMessage } from '@/services/socket';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Socket integration
  const {
    isConnected,
    currentRoom,
    partner,
    sendTextMessage,
    sendVoiceMessage,
    leaveChat,
    startTyping,
    stopTyping,
    onTextMessage,
    onVoiceMessage,
    onPartnerTyping,
    onMessageStatus
  } = useSocketContext();
  
  // Local state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isWaitingForMatch, setIsWaitingForMatch] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const { topic, feeling } = location.state || {};
  const userRole = user?.role || 'talker';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update connection status based on socket connection
  useEffect(() => {
    if (isConnected && currentRoom) {
      setConnectionStatus('connected');
      setIsWaitingForMatch(false);
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('connecting');
    }
  }, [isConnected, currentRoom]);

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for incoming text messages
    onTextMessage((socketMessage: SocketMessage) => {
      const newMessage: Message = {
        id: socketMessage.id,
        sender: socketMessage.senderId === user?.id ? userRole : (userRole === 'listener' ? 'talker' : 'listener'),
        content: socketMessage.text || '',
        timestamp: new Date(socketMessage.timestamp),
        type: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
    });

    // Listen for incoming voice messages
    onVoiceMessage((socketMessage: SocketMessage) => {
      const newMessage: Message = {
        id: socketMessage.id,
        sender: socketMessage.senderId === user?.id ? userRole : (userRole === 'listener' ? 'talker' : 'listener'),
        content: '',
        timestamp: new Date(socketMessage.timestamp),
        type: 'voice',
        audioData: socketMessage.audioData,
        duration: 5 // Default duration, backend should provide this
      };
      setMessages(prev => [...prev, newMessage]);
    });

    // Listen for partner typing
    onPartnerTyping(({ isTyping, roomId }) => {
      if (roomId === currentRoom) {
        setPartnerTyping(isTyping);
      }
    });

    // Listen for message status updates
    onMessageStatus(({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    });
  }, [isConnected, currentRoom, user, userRole, onTextMessage, onVoiceMessage, onPartnerTyping, onMessageStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRoom) {
        leaveChat();
      }
    };
  }, []);

  const handleMatchFound = (roomId: string, partnerInfo: UserInfo) => {
    setIsWaitingForMatch(false);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      sender: userRole === 'listener' ? 'talker' : 'listener',
      content: userRole === 'listener' 
        ? "Hi! I'm here and ready to talk. Thank you for being willing to listen."
        : "Hello! I'm here to listen. Feel free to share whatever is on your mind - this is a safe space.",
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
    
    toast({
      title: "Match Found!",
      description: `Connected with a ${partnerInfo.role}. Your conversation is anonymous.`,
    });
  };

  const handleCancelWaiting = () => {
    navigate('/');
  };

  const handleSendMessage = () => {
    if (message.trim() && connectionStatus === 'connected' && currentRoom) {
      const sanitizedMessage = sanitizeInput(message);
      
      // Add message to local state immediately (optimistic update)
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: sanitizedMessage,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Send through socket
      try {
        sendTextMessage(sanitizedMessage);
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({
          title: "Failed to send",
          description: "Your message couldn't be sent. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSendVoiceMessage = (audioData: string, duration: number) => {
    if (connectionStatus === 'connected' && currentRoom) {
      // Add message to local state immediately (optimistic update)
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: '',
        timestamp: new Date(),
        type: 'voice',
        audioData,
        duration
      };
      setMessages(prev => [...prev, newMessage]);

      // Send through socket
      try {
        sendVoiceMessage(audioData);
        
        toast({
          title: "Voice message sent",
          description: "Your voice message has been delivered.",
        });
      } catch (error) {
        console.error('Failed to send voice message:', error);
        toast({
          title: "Failed to send",
          description: "Your voice message couldn't be sent. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEndChat = () => {
    if (currentRoom) {
      leaveChat();
    }
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (rating: number, feedbackText: string) => {
    console.log('Feedback submitted:', { 
      rating, 
      feedbackText, 
      sessionDetails: { 
        roomId: currentRoom,
        userRole,
        topic, 
        feeling, 
        messageCount: messages.length 
      } 
    });
    
    // TODO: Submit feedback to backend API
    
    toast({
      title: "Chat Ended",
      description: "Thank you for using VentOut and for your feedback. Take care of yourself.",
    });
    
    navigate('/');
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    toast({
      title: "Chat Ended",
      description: "Thank you for using VentOut. Take care of yourself.",
    });
    navigate('/');
  };

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. We take all reports seriously.",
    });
  };

  // Show waiting screen for talkers
  if (userRole === 'talker' && isWaitingForMatch) {
    return (
      <Layout>
        <WaitingForMatch
          topic={topic}
          feeling={feeling}
          onMatchFound={handleMatchFound}
          onCancel={handleCancelWaiting}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <ChatHeader
          userRole={userRole}
          connectionStatus={connectionStatus}
          sessionId={currentRoom || 'connecting'}
          topic={topic}
          feeling={feeling}
        />

        <MessageList
          messages={messages}
          userRole={userRole}
          partnerTyping={partnerTyping}
          messagesEndRef={messagesEndRef}
        />

        <MessageInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onSendVoiceMessage={handleSendVoiceMessage}
          onEndChat={handleEndChat}
          onReport={handleReport}
          connectionStatus={connectionStatus}
        />
      </div>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />
    </Layout>
  );
};

export default ChatPage;
