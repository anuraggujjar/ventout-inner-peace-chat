
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/privacy';

interface Message {
  id: string;
  sender: 'listener' | 'talker';
  content: string;
  timestamp: Date;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showFeedback, setShowFeedback] = useState(false);
  const [userRole, setUserRole] = useState<'listener' | 'talker'>('talker');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  
  const { topic, feeling } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat session directly
    initializeChatSession();
    
    return () => {
      // Cleanup on unmount
      if (sessionId) {
        leaveChatSession();
      }
    };
  }, []);

  const initializeChatSession = async () => {
    try {
      // Generate session ID and determine role
      const newSessionId = 'chat_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      
      // Connect directly without waiting room
      setConnectionStatus('connected');
      
      // Randomly assign roles or use URL parameter
      const role = Math.random() > 0.5 ? 'listener' : 'talker';
      setUserRole(role);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: '1',
        sender: role === 'listener' ? 'talker' : 'listener',
        content: role === 'listener' 
          ? "Hi! I'm here and ready to talk. Thank you for being willing to listen."
          : "Hello! I'm here to listen. Feel free to share whatever is on your mind - this is a safe space.",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      toast({
        title: "Connected!",
        description: `You're now connected as a ${role}. The conversation is completely anonymous.`,
      });
      
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  const leaveChatSession = () => {
    // In a real implementation, notify the server about leaving
    console.log('Leaving chat session:', sessionId);
  };

  const handleSendMessage = () => {
    if (message.trim() && connectionStatus === 'connected') {
      const sanitizedMessage = sanitizeInput(message);
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: sanitizedMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // In a real implementation, you would send this message through WebSocket
      console.log('Sending message:', newMessage);
      
      // Simulate partner typing indicator occasionally
      if (Math.random() > 0.7) {
        setPartnerTyping(true);
        setTimeout(() => setPartnerTyping(false), 2000 + Math.random() * 3000);
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
