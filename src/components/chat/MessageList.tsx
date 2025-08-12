
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import AudioMessage from './AudioMessage';
import { Message } from '@/types/message';

interface MessageListProps {
  messages: Message[];
  userRole: 'listener' | 'talker';
  partnerTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({ messages, userRole, partnerTyping, messagesEndRef }: MessageListProps) => {
  const getRoleDisplay = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'Listener' : 'Talker';
  };

  const getRoleIcon = (role: 'listener' | 'talker') => {
    return role === 'listener' ? Heart : MessageCircle;
  };

  const getRoleColor = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'green' : 'blue';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
      {messages.map((msg) => {
        const isCurrentUser = msg.sender === userRole;
        const IconComponent = getRoleIcon(msg.sender);
        
        return (
          <div
            key={msg.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                isCurrentUser 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted border border-border'
              }`}>
                <IconComponent size={14} className={isCurrentUser ? 'text-primary' : 'text-muted-foreground'} />
              </div>

              {/* Message Bubble */}
              <div className={`relative px-4 py-3 rounded-2xl shadow-md transition-all duration-200 ${
                isCurrentUser 
                  ? 'bg-primary text-primary-foreground rounded-br-md' 
                  : 'bg-card text-card-foreground border border-border rounded-bl-md'
              }`}>
                {/* Message Content */}
                {msg.type === 'voice' && msg.audioData && msg.duration ? (
                  <div className="w-full min-w-[200px]">
                    <AudioMessage 
                      audioData={msg.audioData}
                      duration={msg.duration}
                      isCurrentUser={isCurrentUser}
                    />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed break-words">
                    {msg.content}
                  </p>
                )}

                {/* Timestamp */}
                <div className={`mt-1 text-xs opacity-75 ${
                  isCurrentUser ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>

                {/* Message tail */}
                <div className={`absolute bottom-0 w-3 h-3 ${
                  isCurrentUser 
                    ? 'right-0 transform translate-x-1 bg-primary' 
                    : 'left-0 transform -translate-x-1 bg-card border-l border-b border-border'
                } ${isCurrentUser ? 'rounded-bl-full' : 'rounded-br-full'}`} />
              </div>
            </div>

            {/* Sender Label */}
            <div className={`text-xs text-muted-foreground mt-1 ${
              isCurrentUser ? 'text-right pr-10' : 'text-left pl-10'
            }`}>
              {isCurrentUser ? 'You' : `Anonymous ${getRoleDisplay(msg.sender)}`}
            </div>
          </div>
        );
      })}

      {/* Partner typing indicator */}
      {partnerTyping && (
        <div className="flex justify-start mb-4">
          <div className="flex items-end gap-2 max-w-[80%]">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-muted border border-border">
              {React.createElement(getRoleIcon(userRole === 'listener' ? 'talker' : 'listener'), { 
                size: 14, 
                className: 'text-muted-foreground' 
              })}
            </div>

            {/* Typing Bubble */}
            <div className="relative px-4 py-3 rounded-2xl rounded-bl-md shadow-md bg-card text-card-foreground border border-border">
              <div className="flex space-x-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>

              {/* Message tail */}
              <div className="absolute bottom-0 left-0 transform -translate-x-1 w-3 h-3 bg-card border-l border-b border-border rounded-br-full" />
            </div>
          </div>

          {/* Typing Label */}
          <div className="text-xs text-muted-foreground mt-1 text-left pl-10">
            Anonymous {getRoleDisplay(userRole === 'listener' ? 'talker' : 'listener')} is typing...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
