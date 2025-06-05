
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, XCircle, MessageCircle, Send, User, Heart, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/privacy';

interface Message {
  id: string;
  sender: 'listener' | 'talker';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  listener: string;
  talker: string;
  topic?: string;
  feeling?: string;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting' | 'disconnected'>('connecting');
  const [showFeedback, setShowFeedback] = useState(false);
  const [userRole, setUserRole] = useState<'listener' | 'talker'>('talker');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [waitingTime, setWaitingTime] = useState(0);
  
  const { topic, feeling } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat session
    initializeChatSession();
    
    return () => {
      // Cleanup on unmount
      if (sessionId) {
        leaveChatSession();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionStatus === 'waiting') {
      interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const initializeChatSession = async () => {
    try {
      // Generate session ID and determine role
      const newSessionId = 'chat_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      
      // In a real implementation, you would connect to a WebSocket or real-time service
      // For now, we'll simulate the connection process
      setConnectionStatus('waiting');
      
      // Simulate finding a partner after 3-8 seconds
      const waitTime = 3000 + Math.random() * 5000;
      setTimeout(() => {
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
      }, waitTime);
      
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoleDisplay = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'Listener' : 'Talker';
  };

  const getRoleIcon = (role: 'listener' | 'talker') => {
    return role === 'listener' ? Heart : MessageCircle;
  };

  const getRoleColor = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'green' : 'blue';
  };

  if (connectionStatus === 'waiting') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Finding Your Chat Partner</h2>
          <p className="text-muted-foreground mb-4">
            We're connecting you with someone who wants to listen...
          </p>
          <div className="text-sm text-muted-foreground mb-6">
            Waiting time: {formatWaitTime(waitingTime)}
          </div>
          {topic && (
            <Badge variant="secondary" className="mb-4">
              Topic: {topic}
            </Badge>
          )}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Your conversation will be completely anonymous</p>
            <p>• No personal information is shared</p>
            <p>• You can end the chat at any time</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mt-6"
          >
            Cancel
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="bg-card border-b border-border/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${getRoleColor(userRole)}-500/20 to-${getRoleColor(userRole)}-600/20 flex items-center justify-center`}>
                  {React.createElement(getRoleIcon(userRole), { size: 20, className: `text-${getRoleColor(userRole)}-500` })}
                </div>
                <span className="font-medium text-primary">You ({getRoleDisplay(userRole)})</span>
              </div>
              
              <div className="text-2xl text-muted-foreground">↔</div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-500/20 to-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-600/20 flex items-center justify-center`}>
                  {React.createElement(getRoleIcon(userRole === 'listener' ? 'talker' : 'listener'), { size: 20, className: `text-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-500` })}
                </div>
                <div>
                  <span className="font-medium text-primary">Anonymous {getRoleDisplay(userRole === 'listener' ? 'talker' : 'listener')}</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                      connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-muted-foreground capitalize">{connectionStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center space-x-2">
                {topic && (
                  <Badge variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                )}
                {feeling && (
                  <Badge variant="outline" className="text-xs">
                    {feeling}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Session ID: {sessionId.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === userRole;
            const IconComponent = getRoleIcon(msg.sender);
            const roleColor = getRoleColor(msg.sender);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-md ${isCurrentUser ? 'bg-primary text-primary-foreground' : ''}`}>
                  <CardContent className="p-4">
                    <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrentUser 
                          ? 'bg-primary-foreground/20' 
                          : `bg-gradient-to-br from-${roleColor}-500/20 to-${roleColor}-600/20`
                      }`}>
                        <IconComponent size={16} className={isCurrentUser ? 'text-primary-foreground' : `text-${roleColor}-500`} />
                      </div>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <p className={`text-sm font-medium mb-1 ${
                          isCurrentUser ? 'text-primary-foreground' : 'text-primary'
                        }`}>
                          {isCurrentUser ? 'You' : `Anonymous ${getRoleDisplay(msg.sender)}`}
                        </p>
                        <p className={`text-sm ${
                          isCurrentUser ? 'text-primary-foreground' : 'text-foreground'
                        }`}>
                          {msg.content}
                        </p>
                        <p className={`text-xs mt-2 ${
                          isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Partner typing indicator */}
          {partnerTyping && (
            <div className="flex justify-start">
              <Card className="max-w-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-500/20 to-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-600/20 flex items-center justify-center flex-shrink-0`}>
                      {React.createElement(getRoleIcon(userRole === 'listener' ? 'talker' : 'listener'), { size: 16, className: `text-${getRoleColor(userRole === 'listener' ? 'talker' : 'listener')}-500` })}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Anonymous {getRoleDisplay(userRole === 'listener' ? 'talker' : 'listener')}</p>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="border-t border-border/50 p-4 bg-card">
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={connectionStatus !== 'connected'}
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!message.trim() || connectionStatus !== 'connected'}
                className="hover:scale-105 transition-transform duration-200"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleEndChat} className="hover:scale-105 transition-transform duration-200">
              <XCircle className="mr-2 h-4 w-4" /> End Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleReport} className="hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="mr-2 h-4 w-4" /> Report
            </Button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="px-4 py-2 bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            This conversation is anonymous and confidential. You are chatting with a real person.
          </p>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />
    </Layout>
  );
};

export default ChatPage;
