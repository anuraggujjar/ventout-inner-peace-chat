import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { UserInfo } from '@/services/socket';

interface WaitingForMatchProps {
  topic?: string;
  feeling?: string;
  onMatchFound: (roomId: string, partner: UserInfo) => void;
  onCancel: () => void;
}

const WaitingForMatch = ({ topic, feeling, onMatchFound, onCancel }: WaitingForMatchProps) => {
  const { joinWaitingQueue, leaveWaitingQueue, currentRoom, partner } = useSocket();
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    // Join the waiting queue when component mounts
    joinWaitingQueue();

    // Start timer
    const interval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      leaveWaitingQueue();
    };
  }, []);

  // Listen for match found
  useEffect(() => {
    if (currentRoom && partner) {
      onMatchFound(currentRoom, partner);
    }
  }, [currentRoom, partner, onMatchFound]);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    leaveWaitingQueue();
    onCancel();
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-md mx-auto text-center p-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
        <MessageCircle className="h-8 w-8 text-blue-500 animate-pulse" />
      </div>
      
      <h2 className="text-2xl font-bold text-primary mb-2">Finding a Listener</h2>
      <p className="text-muted-foreground mb-4">
        We're connecting you with someone who wants to listen...
      </p>
      
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Waiting time:</span>
          <span className="font-mono text-lg font-semibold text-primary">
            {formatWaitTime(waitingTime)}
          </span>
        </div>
        
        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((waitingTime / 60) * 100, 100)}%` }}
          />
        </div>
      </div>

      {(topic || feeling) && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {topic && (
            <Badge variant="secondary" className="text-xs">
              Topic: {topic}
            </Badge>
          )}
          {feeling && (
            <Badge variant="outline" className="text-xs">
              Feeling: {feeling}
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-2 text-xs text-muted-foreground mb-6 max-w-xs">
        <p>• Your conversation will be completely anonymous</p>
        <p>• No personal information is shared</p>
        <p>• You can end the chat at any time</p>
        <p>• A listener will join you shortly</p>
      </div>

      <Button 
        variant="outline" 
        onClick={handleCancel}
        className="mt-4"
      >
        Cancel & Go Back
      </Button>
    </div>
  );
};

export default WaitingForMatch;