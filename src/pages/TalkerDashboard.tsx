import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { MessageCircle, LogOut, Users, Clock, Heart, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '@/services/socket';

interface ChatRequest {
  id: string;
  listener: UserInfo;
  timestamp: Date;
}

export const TalkerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    isConnected, 
    currentRoom, 
    partner, 
    joinWaitingQueue, 
    leaveWaitingQueue 
  } = useSocketContext();
  
  const [isInQueue, setIsInQueue] = useState(false);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [showChat, setShowChat] = useState(false);

  // Listen for match found events
  useEffect(() => {
    if (currentRoom && partner) {
      setShowChat(true);
      setIsInQueue(false);
      navigate('/chat');
    }
  }, [currentRoom, partner, navigate]);

  // Listen for incoming chat requests
  useEffect(() => {
    // TODO: Add socket listener for incoming chat requests
    // socketService.onChatRequest(handleNewChatRequest);
  }, []);

  const handleLogout = async () => {
    if (isInQueue) {
      leaveWaitingQueue();
    }
    await logout();
    navigate('/auth');
  };

  const handleJoinQueue = () => {
    if (!isConnected) return;
    
    joinWaitingQueue();
    setIsInQueue(true);
  };

  const handleLeaveQueue = () => {
    if (!isConnected) return;
    
    leaveWaitingQueue();
    setIsInQueue(false);
  };

  const handleAcceptRequest = (requestId: string) => {
    // TODO: Implement accept request logic
    console.log('Accepting request:', requestId);
    setChatRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleRejectRequest = (requestId: string) => {
    // TODO: Implement reject request logic
    console.log('Rejecting request:', requestId);
    setChatRequests(prev => prev.filter(req => req.id !== requestId));
  };

  if (showChat) {
    return null; // Will be handled by navigation to /chat
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <CardTitle>VentOut - Talker Portal</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <span>Welcome, Talker {user?.name || user?.email}!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Role: <span className="font-medium capitalize text-blue-600">{user?.role}</span>
              </p>
              <p className="text-muted-foreground">
                Email: <span className="font-medium">{user?.email}</span>
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Status</span>
              <Badge variant={isInQueue ? "default" : "secondary"}>
                {isInQueue ? "Waiting for match" : "Idle"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isInQueue ? (
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You're currently not looking for someone to talk to
                  </p>
                </div>
                <Button 
                  onClick={handleJoinQueue}
                  disabled={!isConnected}
                  className="w-full"
                  size="lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Start Looking for a Listener
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground">
                    Looking for available listeners...
                  </p>
                </div>
                <Button 
                  onClick={handleLeaveQueue}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Stop Looking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Requests */}
        {chatRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-green-500" />
                <span>Incoming Chat Requests</span>
                <Badge variant="destructive">{chatRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chatRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                          <Heart size={20} className="text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Anonymous Listener</p>
                          <p className="text-sm text-muted-foreground">
                            Wants to chat • {new Date(request.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">4.9</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};