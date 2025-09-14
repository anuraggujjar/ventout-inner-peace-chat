import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const GoogleLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.googleLogin();
      // The redirect will be handled by Supabase
    } catch (error) {
      if (error instanceof Error && error.message.includes('redirect in progress')) {
        // This is expected for Google OAuth flow
        return;
      }
      
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      variant="outline"
      size="lg"
      className="w-full"
    >
      <Chrome className="mr-2 h-4 w-4" />
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};