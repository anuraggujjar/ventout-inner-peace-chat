
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useNavigate } from 'react-router-dom';

const RoleSelector = () => {
  const { setUserRole } = useUserRole();
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'talker' | 'listener') => {
    setUserRole(role);
    if (role === 'listener') {
      navigate('/listener-dashboard');
    } else {
      navigate('/topic-selection');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">How would you like to help today?</h2>
        <p className="text-muted-foreground">Choose your role to get started</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection('talker')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>I need to talk</CardTitle>
            <CardDescription>Connect with a caring listener</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleRoleSelection('talker')}>
              Start Talking
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelection('listener')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>I want to listen</CardTitle>
            <CardDescription>Help others by lending an ear</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" onClick={() => handleRoleSelection('listener')}>
              Be a Listener
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector;
