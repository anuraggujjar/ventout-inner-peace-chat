
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Headphones } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';

const RoleSelector = () => {
  const { setUserRole } = useUserRole();

  const handleSelectTalker = () => {
    console.log("Selected Talker role");
    setUserRole('talker');
  };

  const handleSelectListener = () => {
    console.log("Selected Listener role");
    setUserRole('listener');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">How would you like to help today?</h2>
        <p className="text-muted-foreground">Choose your role to get started</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30" onClick={handleSelectTalker}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">I need to talk</CardTitle>
            <CardDescription>
              Connect with a caring listener who will provide support and understanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSelectTalker}
            >
              Start Talking
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30" onClick={handleSelectListener}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
              <Headphones className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-xl">I want to listen</CardTitle>
            <CardDescription>
              Offer support and be there for someone who needs a caring ear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="secondary" 
              className="w-full" 
              size="lg"
              onClick={handleSelectListener}
            >
              Be a Listener
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector;
