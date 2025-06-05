
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  userRole: 'listener' | 'talker';
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  sessionId: string;
  topic?: string;
  feeling?: string;
}

const ChatHeader = ({ userRole, connectionStatus, sessionId, topic, feeling }: ChatHeaderProps) => {
  const getRoleDisplay = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'Listener' : 'Talker';
  };

  const getRoleIcon = (role: 'listener' | 'talker') => {
    return role === 'listener' ? Heart : MessageCircle;
  };

  const getRoleColor = (role: 'listener' | 'talker') => {
    return role === 'listener' ? 'green' : 'blue';
  };

  return (
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
  );
};

export default ChatHeader;
