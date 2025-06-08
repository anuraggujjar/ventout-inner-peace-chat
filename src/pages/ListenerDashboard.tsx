
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, Users, Clock } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';

const ListenerDashboard = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();

  const handleBeListener = () => {
    navigate('/listener-queue');
  };

  const handleStartTalking = () => {
    navigate('/topic-selection');
  };

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Listener Dashboard</h1>
          <p className="text-muted-foreground mb-6">Welcome back! How would you like to help today?</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">People waiting</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg wait time</p>
                  <p className="text-2xl font-bold">5m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your sessions</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Be a Listener</CardTitle>
              <CardDescription>
                Help someone who needs support by listening to their concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" onClick={handleBeListener}>
                <Heart className="mr-2 h-5 w-5" />
                Start Listening
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Connect with people who need someone to talk to
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Start Talking</CardTitle>
              <CardDescription>
                Sometimes listeners need support too. Share what's on your mind
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleStartTalking}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Need Support
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Get connected with another listener
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={handleLogout}>
            Switch Role
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ListenerDashboard;
