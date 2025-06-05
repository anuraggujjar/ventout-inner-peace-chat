
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, Users, Clock } from 'lucide-react';

const ListenerDashboard = () => {
  const navigate = useNavigate();

  const handleBeListener = () => {
    navigate('/listener-queue');
  };

  const handleStartTalking = () => {
    navigate('/topic-selection');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Heart size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Listener Dashboard</h1>
          <p className="text-muted-foreground">Choose how you'd like to help today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleBeListener}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-green-500" />
              </div>
              <CardTitle className="text-xl">Be a Listener</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Help others by listening to their stories and providing support. View people who need someone to talk to.
              </p>
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleBeListener}
              >
                Start Listening
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartTalking}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-blue-500" />
              </div>
              <CardTitle className="text-xl">Start Talking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Sometimes listeners need to talk too. Share what's on your mind with another caring listener.
              </p>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full"
                onClick={handleStartTalking}
              >
                Find a Listener
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>All conversations are anonymous and confidential</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListenerDashboard;
