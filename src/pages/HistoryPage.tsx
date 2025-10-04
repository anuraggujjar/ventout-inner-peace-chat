
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, User, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: string;
  topic: string;
  feeling: string;
  startTime: Date;
  duration: number;
  listenerName: string;
  messageCount: number;
}

const HistoryPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = 'https://ventoutserver.onrender.com';

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/conversations`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const conversations = await response.json();
        
        // Map API response to ChatSession format
        const mappedHistory: ChatSession[] = conversations.map((conv: any) => ({
          id: conv._id || conv.id,
          topic: conv.topic || 'general',
          feeling: conv.feeling || 'ok',
          startTime: new Date(conv.createdAt),
          duration: conv.duration || 0,
          listenerName: conv.listenerName || 'Anonymous',
          messageCount: conv.messageCount || 0
        }));

        setChatHistory(mappedHistory);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast({
          title: "Error",
          description: "Could not load chat history. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [user, toast]);


  const getTopicLabel = (topic: string) => {
    const topicMap: { [key: string]: string } = {
      'general': 'General Chat',
      'relationships': 'Relationships',
      'work-stress': 'Work Stress',
      'family': 'Family Issues',
      'married-life': 'Married Life',
      'lgbtq': 'LGBTQ Identity',
      'loneliness': 'Loneliness & Depression'
    };
    return topicMap[topic] || topic;
  };

  const getFeelingEmoji = (feeling: string) => {
    const feelingMap: { [key: string]: string } = {
      'ok': '😊',
      'not-ok': '😔',
      'dont-know': '🤷‍♀️'
    };
    return feelingMap[feeling] || '😐';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      setChatHistory(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Session Deleted",
        description: "Chat session has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Could not delete session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Chat History</h1>
            <p className="text-muted-foreground">Your previous conversations with listeners</p>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading your chat history...</h3>
              <p className="text-muted-foreground">Please wait a moment</p>
            </CardContent>
          </Card>
        ) : chatHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chat history found</h3>
              <p className="text-muted-foreground mb-4">
                Start your first conversation to see it here.
              </p>
              <Button onClick={() => window.location.href = '/topic-selection'}>
                Start New Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{getTopicLabel(session.topic)}</span>
                        <span className="text-xl">{getFeelingEmoji(session.feeling)}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(session.startTime)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>with {session.listenerName}</span>
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">
                        {formatDuration(session.duration)}
                      </Badge>
                      <Badge variant="outline">
                        {session.messageCount} messages
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Your chat history is stored locally on your device for privacy. 
              Data is automatically deleted after 30 days unless manually cleared.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HistoryPage;
