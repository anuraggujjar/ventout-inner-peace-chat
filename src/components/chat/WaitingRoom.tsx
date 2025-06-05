
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface WaitingRoomProps {
  waitingTime: number;
  topic?: string;
  onCancel: () => void;
}

const WaitingRoom = ({ waitingTime, topic, onCancel }: WaitingRoomProps) => {
  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
        onClick={onCancel}
        className="mt-6"
      >
        Cancel
      </Button>
    </div>
  );
};

export default WaitingRoom;
