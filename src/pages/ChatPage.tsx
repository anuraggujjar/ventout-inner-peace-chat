
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, ShieldAlert, XCircle, MessageCircle, Send, User, Heart, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/privacy';

interface Message {
  id: string;
  sender: 'user' | 'listener';
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
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connected');
  
  const { userName = 'You', listenerName = 'Sarah', topic, feeling } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      sender: 'listener',
      content: `Hi! I'm ${listenerName}, your listener today. I'm here to provide a safe space for you to share whatever is on your mind. How are you feeling right now?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Simulate typing indicator
    const typingInterval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 8000);

    return () => clearInterval(typingInterval);
  }, [listenerName]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const sanitizedMessage = sanitizeInput(message);
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: sanitizedMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Simulate listener response after a delay
      setTimeout(() => {
        const responses = [
          "Thank you for sharing that with me. Can you tell me more about how that makes you feel?",
          "I hear you, and I want you to know that your feelings are valid. What's been the most challenging part for you?",
          "That sounds really difficult. How have you been coping with this situation?",
          "I appreciate you opening up about this. What kind of support would be most helpful right now?",
          "It takes courage to talk about these things. How long have you been feeling this way?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const listenerMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'listener',
          content: randomResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, listenerMessage]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleEndChat = () => {
    toast({
      title: "Chat Ended",
      description: "Thank you for using Sola. Take care of yourself.",
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

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="bg-card border-b border-border/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <User size={20} className="text-blue-500" />
                </div>
                <span className="font-medium text-primary">{userName}</span>
              </div>
              
              <div className="text-2xl text-muted-foreground">↔</div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <Heart size={20} className="text-green-500" />
                </div>
                <div>
                  <span className="font-medium text-primary">{listenerName}</span>
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
                <Badge variant="secondary" className="text-xs">
                  {topic || 'General'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {feeling || 'Not specified'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Session started at {formatTime(new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                <CardContent className="p-4">
                  <div className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' 
                        ? 'bg-primary-foreground/20' 
                        : 'bg-gradient-to-br from-green-500/20 to-green-600/20'
                    }`}>
                      {msg.sender === 'user' ? (
                        <User size={16} className={msg.sender === 'user' ? 'text-primary-foreground' : 'text-blue-500'} />
                      ) : (
                        <Heart size={16} className="text-green-500" />
                      )}
                    </div>
                    <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      <p className={`text-sm font-medium mb-1 ${
                        msg.sender === 'user' ? 'text-primary-foreground' : 'text-primary'
                      }`}>
                        {msg.sender === 'user' ? userName : listenerName}
                      </p>
                      <p className={`text-sm ${
                        msg.sender === 'user' ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="max-w-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center flex-shrink-0">
                      <Heart size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">{listenerName}</p>
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
                disabled={connectionStatus === 'disconnected'}
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!message.trim() || connectionStatus === 'disconnected'}
                className="hover:scale-105 transition-transform duration-200"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleEndChat} className="hover:scale-105 transition-transform duration-200">
                <XCircle className="mr-2 h-4 w-4" /> End Chat
              </Button>
              <Button variant="outline" size="sm" onClick={handleReport} className="hover:scale-105 transition-transform duration-200">
                <ShieldAlert className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Phone size={16} className="mr-2" />
                <span className="hidden sm:inline">Voice Call - Coming Soon!</span>
                <span className="sm:hidden">Voice</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Video size={16} className="mr-2" />
                <span className="hidden sm:inline">Video Call - Coming Soon!</span>
                <span className="sm:hidden">Video</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="px-4 py-2 bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            This conversation is anonymous and confidential. Messages are not stored permanently.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
