
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowLeft, Users, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatRequest {
  id: string;
  topic: string;
  feeling: string | null;
  anonymous_id: string;
  created_at: string;
  status: string;
}

const ListenerQueue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatRequests(data || []);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRequests();

    // Set up real-time subscription
    const channel = supabase
      .channel('chat-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_requests',
          filter: 'status=eq.waiting'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchChatRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleJoinChat = async (requestId: string) => {
    if (!user) return;

    try {
      // Create listener session
      const { error: sessionError } = await supabase
        .from('listener_sessions')
        .insert({
          listener_id: user.id,
          chat_request_id: requestId,
          status: 'active'
        });

      if (sessionError) throw sessionError;

      // Update chat request status to matched
      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({ status: 'matched' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      console.log(`Joining chat with request ${requestId}`);
      navigate('/chat');
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/listener-dashboard');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitTime = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    return `${diffMinutes}m`;
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
          {chatRequests.length === 0 ? (
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
            chatRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        {request.anonymous_id}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        Waiting {getWaitTime(request.created_at)} • Topic: {request.topic}
                        {request.feeling && ` • Feeling: ${request.feeling}`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Requested at {formatTime(request.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleJoinChat(request.id)}
                  >
                    Start Listening
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {chatRequests.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Queue updates automatically • {chatRequests.length} {chatRequests.length === 1 ? 'person' : 'people'} waiting
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListenerQueue;
