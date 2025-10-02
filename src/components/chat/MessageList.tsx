
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import AudioMessage from './AudioMessage';
import { Message } from '@/types/message';
import { User } from '@/services/auth';

interface MessageListProps {
  messages: Message[];
  userRole: 'listener' | 'talker';
  partnerTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  user: User | null;
}

const MessageList = ({ messages, userRole, partnerTyping, messagesEndRef, user }: MessageListProps) => {
  const getRoleDisplay = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'Listener' : 'Talker';
  };

  const getRoleIcon = (role: 'listener' | 'talker') => {
    return role === 'listener' ? Heart : MessageCircle;
  };

  const getRoleColor = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'green' : 'blue';
  };

  const formatTime = (dateString: string | Date | undefined) => {
    // Check if the date string exists
    if (!dateString) {
      console.log('Formatting date: undefined');
      return '...'; // Return a placeholder to prevent the crash
    }

    // Convert the ISO string to a Date object if it's a string
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    // Return the formatted time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const normalizeRole = (sender: string): 'listener' | 'talker' => {
    if (sender === 'listener' || sender === 'talker') {
      return sender;
    }
    // Default fallback
    return userRole === 'listener' ? 'talker' : 'listener';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
      {messages.map((msg) => {
        console.log('Message:', msg);
        const isCurrentUser = msg.senderId === user?.id;
        const normalizedSender = isCurrentUser ? userRole : (userRole === 'listener' ? 'talker' : 'listener');
        const IconComponent = getRoleIcon(normalizedSender);
        console.log('Message:', isCurrentUser, msg);
        const roleColor = getRoleColor(normalizedSender);
        
        return (
          <div
            key={msg.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-lg border-[0.5px] ${isCurrentUser ? 'bg-primary text-primary-foreground border-primary/30 ring-1 ring-primary/10' : 'border-border/40 ring-1 ring-border/5'}`}>
              <CardContent className="p-2">
                <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCurrentUser 
                      ? 'bg-primary-foreground/20' 
                      : `bg-gradient-to-br from-${roleColor}-500/20 to-${roleColor}-600/20`
                  }`}>
                    <IconComponent size={12} className={isCurrentUser ? 'text-primary-foreground' : `text-${roleColor}-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <p className={`text-xs font-medium ${
                        isCurrentUser ? 'text-primary-foreground' : 'text-primary'
                      }`}>
                        {isCurrentUser ? 'You' : `Anonymous ${getRoleDisplay(normalizedSender)}`}
                      </p>
                      <p className={`text-xs ${
                        isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(msg.timestamp || msg.createdAt)}
                      </p>
                    </div>
                    
                    {msg.type === 'voice' && msg.audioData && msg.duration ? (
                      <div className="w-full">
                        <AudioMessage 
                          audioData={msg.audioData}
                          duration={msg.duration}
                          isCurrentUser={isCurrentUser}
                        />
                      </div>
                    ) : (
                      <p className={`text-sm ${
                        isCurrentUser ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {msg.content}
                      </p>
                    )}
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
          <Card className="max-w-md border-[0.5px] border-border/40 ring-1 ring-border/5">
            <CardContent className="p-2">
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
  );
};

export default MessageList;
