
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, MessageSquare, Users, Clock, Heart } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';

const ListenerDashboard = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();

  const handleBeListener = () => {
    console.log("Navigating to Listener Queue");
    navigate('/listener-queue');
  };

  const handleStartTalking = () => {
    console.log("Switching to Talker mode");
    setUserRole('talker');
    navigate('/topic-selection');
  };

  const handleBackToRoleSelection = () => {
    setUserRole(null);
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Listener Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Ready to make a difference today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">People Helped</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listeners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-foreground">8</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Wait</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">3m</div>
              <p className="text-xs text-muted-foreground">For support</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Headphones className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Be a Listener</CardTitle>
              <CardDescription className="text-base">
                Join the queue and help someone who needs support right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full py-4 text-lg"
                onClick={handleBeListener}
              >
                <Headphones className="mr-2 h-6 w-6" />
                Start Listening
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                3 people currently waiting for support
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">Start Talking</CardTitle>
              <CardDescription className="text-base">
                Sometimes listeners need someone to talk to as well
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary"
                size="lg" 
                className="w-full py-4 text-lg"
                onClick={handleStartTalking}
              >
                <MessageSquare className="mr-2 h-6 w-6" />
                I Need Support
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Switch to talker mode
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleBackToRoleSelection}
            className="mt-4"
          >
            Back to Role Selection
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ListenerDashboard;
