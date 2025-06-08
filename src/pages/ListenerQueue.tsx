
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MessageSquare, RefreshCw, Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface WaitingUser {
  id: string;
  topic: string;
  timestamp: Date;
  feeling: string;
  waitTime: number;
}

const ListenerQueue = () => {
  const navigate = useNavigate();
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate real-time data
  useEffect(() => {
    const generateMockUsers = (): WaitingUser[] => {
      const topics = ['Anxiety', 'Relationships', 'Work Stress', 'Family Issues', 'Loneliness', 'General Support'];
      const feelings = ['Anxious', 'Sad', 'Overwhelmed', 'Stressed', 'Lonely', 'Confused'];
      
      return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: `user_${Date.now()}_${i}`,
        topic: topics[Math.floor(Math.random() * topics.length)],
        feeling: feelings[Math.floor(Math.random() * feelings.length)],
        timestamp: new Date(Date.now() - Math.random() * 900000), // Random time in last 15 minutes
        waitTime: Math.floor(Math.random() * 15) + 1
      }));
    };

    const loadUsers = () => {
      setIsLoading(true);
      setTimeout(() => {
        setWaitingUsers(generateMockUsers());
        setIsLoading(false);
        setLastRefresh(new Date());
      }, 1000);
    };

    loadUsers();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinChat = (user: WaitingUser) => {
    toast.success(`Connecting you with someone who needs support...`);
    // Simulate connecting to chat
    setTimeout(() => {
      navigate('/chat', { 
        state: { 
          role: 'listener', 
          topic: user.topic,
          userFeeling: user.feeling 
        } 
      });
    }, 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const topics = ['Anxiety', 'Relationships', 'Work Stress', 'Family Issues', 'Loneliness', 'General Support'];
      const feelings = ['Anxious', 'Sad', 'Overwhelmed', 'Stressed', 'Lonely', 'Confused'];
      
      const newUsers = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: `user_${Date.now()}_${i}`,
        topic: topics[Math.floor(Math.random() * topics.length)],
        feeling: feelings[Math.floor(Math.random() * feelings.length)],
        timestamp: new Date(Date.now() - Math.random() * 900000),
        waitTime: Math.floor(Math.random() * 15) + 1
      }));
      
      setWaitingUsers(newUsers);
      setIsLoading(false);
      setLastRefresh(new Date());
      toast.success('Queue updated');
    }, 1000);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/listener-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Listener Queue</h1>
              <p className="text-muted-foreground">People who need someone to talk to</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Queue Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Waiting for support</p>
                  <p className="text-xl font-bold">{waitingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="text-sm font-medium">{lastRefresh.toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-green-600">Online & Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waiting Users List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading people who need support...</p>
            </div>
          ) : waitingUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No one waiting right now</h3>
                <p className="text-muted-foreground mb-4">
                  Check back soon or refresh to see if anyone needs support.
                </p>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Queue
                </Button>
              </CardContent>
            </Card>
          ) : (
            waitingUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <CardTitle className="text-lg">Anonymous User</CardTitle>
                        <CardDescription>{formatTimeAgo(user.timestamp)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">{user.topic}</Badge>
                      <Badge variant="outline">{user.feeling}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Waiting {user.waitTime}m
                      </span>
                    </div>
                    <Button onClick={() => handleJoinChat(user)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Listening
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ListenerQueue;
