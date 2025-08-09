import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, Users } from 'lucide-react';
import { useSocketContext } from '@/contexts/SocketContext';
import { UserInfo } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

interface TalkerSelectionProps {
  onChatStarted: (roomId: string, partner: UserInfo) => void;
}

const TalkerSelection = ({ onChatStarted }: TalkerSelectionProps) => {
  const { availableTalkers, requestChat, isConnected, currentRoom, partner } = useSocketContext();
  const { toast } = useToast();
  const [selectedTalker, setSelectedTalker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Listen for chat start event
  useEffect(() => {
    if (currentRoom && partner) {
      onChatStarted(currentRoom, partner);
    }
  }, [currentRoom, partner, onChatStarted]);

  const handleSelectTalker = async (talkerId: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please wait for connection to be established",
        variant: "destructive"
      });
      return;
    }

    setSelectedTalker(talkerId);
    setLoading(true);

    try {
      // Request chat with the selected talker
      // The listener ID will be handled on the backend based on the authenticated user
      requestChat('', talkerId); // Backend will use authenticated user as listener
      
      toast({
        title: "Connecting...",
        description: "Requesting to chat with this person",
      });
    } catch (error) {
      console.error('Error requesting chat:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to start chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSelectedTalker(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to chat service...</p>
        </div>
      </div>
    );
  }

  if (availableTalkers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Talkers Available</h3>
        <p className="text-muted-foreground mb-4">
          There are currently no people looking to talk. Please check back later.
        </p>
        <Badge variant="outline" className="text-xs">
          We'll notify you when someone is available
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Choose Someone to Listen To</h2>
        <p className="text-muted-foreground">
          Select a person who needs someone to talk to. Your conversation will be anonymous.
        </p>
      </div>

      <div className="grid gap-4">
        {availableTalkers.map((talker) => (
          <Card key={talker.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <MessageCircle size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{talker.displayName}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${talker.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>{talker.isOnline ? 'Online' : 'Away'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs mb-1">
                    Talker
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>Available now</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSelectTalker(talker.id)}
                  disabled={loading && selectedTalker === talker.id}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  {loading && selectedTalker === talker.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    'Start Listening'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TalkerSelection;