
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatRequest {
  id: string;
  timestamp: Date;
  topic?: string;
  feeling?: string;
  waitTime: number;
}

const ListenerQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate chat requests data
  const generateMockRequests = (): ChatRequest[] => {
    const topics = ['Anxiety', 'Stress', 'Relationships', 'Work', 'Family', 'General'];
    const feelings = ['Overwhelmed', 'Sad', 'Anxious', 'Frustrated', 'Lonely', 'Confused'];
    
    const requests: ChatRequest[] = [];
    const numRequests = Math.floor(Math.random() * 5) + 1; // 1-5 requests
    
    for (let i = 0; i < numRequests; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 30 * 60 * 1000); // Random time within last 30 minutes
      requests.push({
        id: `req_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        topic: Math.random() > 0.3 ? topics[Math.floor(Math.random() * topics.length)] : undefined,
        feeling: Math.random() > 0.4 ? feelings[Math.floor(Math.random() * feelings.length)] : undefined,
        waitTime: Math.floor((Date.now() - timestamp.getTime()) / 1000 / 60), // Wait time in minutes
      });
    }
    
    return requests.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Oldest first
  };

  const loadChatRequests = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setChatRequests(generateMockRequests());
      setIsLoading(false);
      setLastRefresh(new Date());
    }, 1000);
  };

  useEffect(() => {
    loadChatRequests();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      setChatRequests(generateMockRequests());
      setLastRefresh(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoinChat = (request: ChatRequest) => {
    toast({
      title: "Connecting to chat...",
      description: "You'll be connected with the person shortly.",
    });
    
    // Simulate connection and redirect to chat
    setTimeout(() => {
      navigate('/chat', { 
        state: { 
          topic: request.topic, 
          feeling: request.feeling,
          userRole: 'listener'
        } 
      });
    }, 1500);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 1000 / 60);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/listener-dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Listener Queue</h1>
              <p className="text-muted-foreground">People waiting to talk with a listener</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadChatRequests} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mb-4 text-xs text-muted-foreground">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {isLoading ? (
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
        ) : chatRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No one waiting right now</h3>
              <p className="text-muted-foreground mb-4">
                Check back in a few minutes or refresh to see if anyone needs to talk.
              </p>
              <Button variant="outline" onClick={loadChatRequests}>
                <RefreshCw size={16} className="mr-2" />
                Refresh Queue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chatRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Waiting {request.waitTime} minutes • {formatTimeAgo(request.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {request.topic && (
                          <Badge variant="secondary">{request.topic}</Badge>
                        )}
                        {request.feeling && (
                          <Badge variant="outline">{request.feeling}</Badge>
                        )}
                        {!request.topic && !request.feeling && (
                          <Badge variant="outline">General Support</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Anonymous person looking for someone to listen
                      </p>
                    </div>
                    
                    <Button onClick={() => handleJoinChat(request)} className="ml-4">
                      Start Listening
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListenerQueue;
