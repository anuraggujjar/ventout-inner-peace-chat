import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { MessageCircle, LogOut, User, Heart, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TalkerSelection from '@/components/chat/TalkerSelection';
import { UserInfo } from '@/services/socket';

export const ListenerHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    isConnected, 
    availableTalkers, 
    currentRoom, 
    partner 
  } = useSocketContext();
  const [currentView, setCurrentView] = useState<'dashboard' | 'talker-selection'>('dashboard');

  // Listen for active chats
  useEffect(() => {
    if (currentRoom && partner) {
      navigate('/chat');
    }
  }, [currentRoom, partner, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleChatStarted = (roomId: string, chatPartner: UserInfo) => {
    navigate('/chat');
  };

  const handleViewTalkers = () => {
    setCurrentView('talker-selection');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <CardTitle>VentOut - Listener Portal</CardTitle>
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
              <Heart className="h-5 w-5 text-red-500" />
              <span>Welcome, Listener {user?.name || user?.email}!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Role: <span className="font-medium capitalize text-green-600">{user?.role}</span>
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
              {user?.bio && (
                <p className="text-muted-foreground">
                  Bio: <span className="font-medium">{user.bio}</span>
                </p>
              )}
              {user?.interests && user.interests.length > 0 && (
                <p className="text-muted-foreground">
                  Interests: <span className="font-medium">{user.interests.join(', ')}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {currentView === 'dashboard' ? (
          <>
            {/* Listener Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Listener Dashboard</span>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>{availableTalkers.length} talkers available</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleViewTalkers}
                  disabled={!isConnected}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Available Talkers ({availableTalkers.length})
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Chat History
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Listener Resources
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-primary">24</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-green-600">4.8</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Talker Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Available Talkers</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardHeader>
            </Card>
            
            <TalkerSelection onChatStarted={handleChatStarted} />
          </>
        )}

      </div>
    </div>
  );
};