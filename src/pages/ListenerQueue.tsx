
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowLeft, Users, MessageSquare } from 'lucide-react';

interface WaitingUser {
  id: string;
  timestamp: Date;
  topic: string;
  waitTime: string;
  anonymousId: string;
}

const ListenerQueue = () => {
  const navigate = useNavigate();
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data - in real app this would come from Supabase
  const generateMockUsers = (): WaitingUser[] => {
    const topics = ['Anxiety', 'Stress', 'Relationships', 'Work Pressure', 'Family Issues', 'General Support'];
    const users: WaitingUser[] = [];
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 users

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 300000); // Random time within last 5 minutes
      const waitTime = Math.floor((Date.now() - timestamp.getTime()) / 60000);
      
      users.push({
        id: `user_${i + 1}`,
        timestamp,
        topic: topics[Math.floor(Math.random() * topics.length)],
        waitTime: `${waitTime}m`,
        anonymousId: `User${String.fromCharCode(65 + i)}`
      });
    }

    return users.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  useEffect(() => {
    // Initial load
    setTimeout(() => {
      setWaitingUsers(generateMockUsers());
      setIsLoading(false);
    }, 1000);

    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      setWaitingUsers(generateMockUsers());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinChat = (userId: string) => {
    console.log(`Joining chat with user ${userId}`);
    navigate('/chat');
  };

  const handleBackToDashboard = () => {
    navigate('/listener-dashboard');
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Loading Queue...</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Listener Queue</h1>
            <p className="text-muted-foreground">People waiting for support</p>
          </div>
          <Button variant="outline" onClick={handleBackToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-4">
          {waitingUsers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No one waiting right now</CardTitle>
                <CardDescription>
                  Great news! Everyone who needed support has been helped. 
                  Check back soon or take a break.
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleBackToDashboard}
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            waitingUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        {user.anonymousId}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        Waiting {user.waitTime} • Topic: {user.topic}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Requested at {formatTime(user.timestamp)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleJoinChat(user.id)}
                  >
                    Start Listening
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {waitingUsers.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Queue updates automatically • {waitingUsers.length} {waitingUsers.length === 1 ? 'person' : 'people'} waiting
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListenerQueue;
