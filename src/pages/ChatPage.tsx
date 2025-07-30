
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import WaitingRoom from '@/components/chat/WaitingRoom';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeInput } from '@/utils/privacy';
import { Message } from '@/types/message';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { socket, connected, partnerUserId, isMatched, sendMessage: socketSendMessage, sendVoiceMessage: socketSendVoiceMessage, uploadVoiceFile } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const { topic, feeling } = location.state || {};
  const userRole = user?.role || 'talker';
  const connectionStatus = connected ? 'connected' : (socket ? 'connecting' : 'disconnected');
  const sessionId = partnerUserId || 'waiting';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userRole === 'talker' ? 'listener' : 'talker',
        content: data.message || '',
        timestamp: new Date(),
        type: data.voiceUrl ? 'voice' : 'text',
        audioData: data.voiceUrl ? `http://localhost:3000${data.voiceUrl}` : undefined
      };
      setMessages(prev => [...prev, newMessage]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, userRole]);

  // Show welcome message when matched
  useEffect(() => {
    if (isMatched && messages.length === 0) {
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
    }
  }, [isMatched, userRole, messages.length]);

  const handleSendMessage = () => {
    if (message.trim() && connectionStatus === 'connected' && isMatched) {
      const sanitizedMessage = sanitizeInput(message);
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: sanitizedMessage,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Send message via Socket.IO
      socketSendMessage(sanitizedMessage);
    }
  };

  const handleSendVoiceMessage = async (audioData: string, duration: number) => {
    if (connectionStatus === 'connected' && isMatched) {
      try {
        // Upload voice file to backend
        const voiceUrl = await uploadVoiceFile(audioData);
        
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: userRole,
          content: '', // Voice messages don't need text content
          timestamp: new Date(),
          type: 'voice',
          audioData: `http://localhost:3000${voiceUrl}`,
          duration
        };

        setMessages(prev => [...prev, newMessage]);
        
        // Send voice message via Socket.IO
        socketSendVoiceMessage(voiceUrl);
        
        toast({
          title: "Voice message sent",
          description: "Your voice message has been delivered.",
        });
      } catch (error) {
        console.error('Failed to send voice message:', error);
        toast({
          title: "Failed to send voice message",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEndChat = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (rating: number, feedbackText: string) => {
    console.log('Feedback submitted:', { 
      rating, 
      feedbackText, 
      sessionDetails: { 
        sessionId,
        userRole,
        topic, 
        feeling, 
        messageCount: messages.length 
      } 
    });
    
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

  // Show waiting room if not matched
  if (!isMatched) {
    return (
      <Layout>
        <WaitingRoom 
          userRole={userRole}
          onCancel={() => navigate('/')}
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
          sessionId={sessionId}
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
