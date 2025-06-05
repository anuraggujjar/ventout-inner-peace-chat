
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';

interface RoleSelectorProps {
  onRoleSelected: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelected }) => {
  const { setUserRole } = useUserRole();

  const handleSelectRole = (role: 'talker' | 'listener') => {
    setUserRole(role);
    onRoleSelected();
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Welcome to VentOut</h2>
        <p className="text-muted-foreground">How would you like to participate today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectRole('talker')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-blue-500" />
            </div>
            <CardTitle className="text-xl">I Need to Talk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Share what's on your mind with a caring listener. Get the support you need in a safe, anonymous space.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => handleSelectRole('talker')}
            >
              Find a Listener
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectRole('listener')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-green-500" />
            </div>
            <CardTitle className="text-xl">I Want to Listen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Help others by being there to listen. Provide support and comfort to those who need it most.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => handleSelectRole('listener')}
            >
              Start Listening
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector;
