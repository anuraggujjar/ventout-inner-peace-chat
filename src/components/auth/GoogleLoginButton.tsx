import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';
import { lovable } from '@/integrations/lovable';
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
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw new Error(result.error.message ?? 'Google sign-in failed');
      }
      if (result.redirected) return; // browser will redirect

      // Tokens received and session established
      const user = await refreshUser();
      toast({ title: 'Signed in', description: `Welcome${user?.name ? `, ${user.name}` : ''}!` });
      navigate(user?.role === 'listener' ? '/listener/home' : '/topic-selection');
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGoogleLogin} disabled={isLoading} variant="outline" size="lg" className="w-full">
      <Chrome className="mr-2 h-4 w-4" />
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};
