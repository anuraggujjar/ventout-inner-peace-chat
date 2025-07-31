import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, LogOut, Users, MessageCircle, Clock } from 'lucide-react';

// Mock data for demo - in real app, this would come from your backend
const mockChatRequests = [
  { id: '1', name: 'Anonymous User', topic: 'Anxiety', waitTime: '5 min', urgent: false },
  { id: '2', name: 'Anonymous User', topic: 'Relationship Issues', waitTime: '12 min', urgent: true },
  { id: '3', name: 'Anonymous User', topic: 'Work Stress', waitTime: '3 min', urgent: false },
];

const ListenerHomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showRequests, setShowRequests] = useState(false);

  const handleStartListening = () => {
    setShowRequests(true);
  };

  const handleSelectRequest = (requestId: string) => {
    // In real app, this would initiate chat with the specific user
    navigate('/chat', { state: { requestId } });
  };

  const handleWantToTalk = () => {
    // Navigate to the same flow as talkers (topic selection)
    navigate('/topic-selection');
  };

  if (showRequests) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowRequests(false)}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Available Chat Requests</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {mockChatRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{request.name}</h3>
                        {request.urgent && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">Topic: {request.topic}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Waiting for {request.waitTime}
                      </div>
                    </div>
                    <Button onClick={() => handleSelectRequest(request.id)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {mockChatRequests.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Active Requests</h3>
                  <p className="text-muted-foreground">
                    There are currently no users waiting to chat. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, Listener!</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Be a Listener</CardTitle>
              <CardDescription>
                View users currently requesting to chat and provide support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleStartListening}>
                <Users className="w-4 h-4 mr-2" />
                View Chat Requests
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>I Want to Talk</CardTitle>
              <CardDescription>
                Sometimes listeners need support too. Connect with another listener
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={handleWantToTalk}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Venting
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ListenerHomePage;