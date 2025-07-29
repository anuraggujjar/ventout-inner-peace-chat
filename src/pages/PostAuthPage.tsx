import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const PostAuthPage = () => {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Extract tokens from URL params (if backend sends them)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens
      sessionStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Clear URL params for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check auth status and redirect based on role
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default PostAuthPage;