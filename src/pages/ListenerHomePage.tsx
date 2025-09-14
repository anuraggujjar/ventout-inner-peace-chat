import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ListenerHomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || 'Listener'}
          </h1>
          <p className="text-muted-foreground">
            Ready to make a difference in someone's day?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No active conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total sessions completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">People Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Lives touched
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Available Chat Requests
            </CardTitle>
            <CardDescription>
              People are waiting for someone to listen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for people who need support
              </p>
              <Button variant="outline">
                Refresh Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your listening preferences and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Availability Status</p>
                  <p className="text-sm text-muted-foreground">Currently available for new chats</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Available
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Manage Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Resources</CardTitle>
              <CardDescription>
                Guidelines and resources for effective listening
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                📋 Listening Guidelines
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                🆘 Crisis Intervention Protocol
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                💬 Communication Best Practices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};