
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, MessageCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface WaitingRoomProps {
  userRole: 'listener' | 'talker';
  onCancel: () => void;
}

const WaitingRoom = ({ userRole, onCancel }: WaitingRoomProps) => {
  const { connected } = useSocket();
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-md mx-auto text-center p-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-primary mb-2">Finding Your Match</h2>
      <p className="text-muted-foreground mb-4">
        {connected 
          ? `We're connecting you with ${userRole === 'talker' ? 'a listener' : 'someone who needs to talk'}`
          : 'Connecting to server...'
        }
      </p>
      <div className="text-sm text-muted-foreground mb-6">
        {connected ? `Waiting time: ${formatWaitTime(waitingTime)}` : 'Establishing connection...'}
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-center space-x-3 text-sm">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>Anonymous and secure chat</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm">
          <Users className="h-4 w-4 text-primary" />
          <span>Matched with someone compatible</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="mt-6"
      >
        Cancel and Go Back
      </Button>
    </div>
  );
};

export default WaitingRoom;
