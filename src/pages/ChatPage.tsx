
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, ShieldAlert, XCircle, MessageCircle, Send, User, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { userName = 'You', listenerName = 'Sarah', topic, feeling } = location.state || {};

  // Simulate typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 3000);

    return () => clearInterval(typingInterval);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleEndChat = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
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
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Topic: {topic || 'General'}</p>
              <p className="text-xs text-muted-foreground">Mood: {feeling || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {/* Welcome message */}
          <Card className="max-w-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-1">{listenerName}</p>
                  <p className="text-sm text-foreground">
                    Hi! I'm {listenerName}, your listener today. I'm here to provide a safe space for you to share whatever is on your mind. How are you feeling right now?
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typing indicator */}
          {isTyping && (
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
          )}

          {/* Placeholder for future messages */}
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-sm">
              Start the conversation by typing a message below
            </p>
          </div>
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
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!message.trim()}
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
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                <ShieldAlert className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Video size={16} />
              <span>Video Call - Coming Soon!</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="px-4 py-2 bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            This conversation is anonymous and confidential. Messages are not stored.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
