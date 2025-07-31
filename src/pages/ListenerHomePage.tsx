import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ListenerHomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleStartListening = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Listener Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                <Headphones className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Go Online</CardTitle>
              <CardDescription>
                Make yourself available to support talkers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleStartListening}>Start Listening</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                View and manage your current conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View Sessions</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Materials</CardTitle>
              <CardDescription>
                Access training resources and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View Training</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ListenerHomePage;