import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageCircle, Headphones } from 'lucide-react';

const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleRoleSelection = async (role: 'talker' | 'listener') => {
    setLoading(true);
    // This would typically make an API call to update the user's role
    // For now, we'll simulate it
    try {
      const response = await fetch('http://localhost:3000/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        // Redirect based on role
        window.location.href = role === 'talker' ? '/talker/home' : '/listener/home';
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Role selection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Role</CardTitle>
          <CardDescription>
            Select how you'd like to participate in the community
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Talker</CardTitle>
                <CardDescription>
                  Share your thoughts, experiences, and connect with listeners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleRoleSelection('talker')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Continue as Talker'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Headphones className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-lg">Listener</CardTitle>
                <CardDescription>
                  Provide support, guidance, and be there for others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleRoleSelection('listener')}
                  disabled={loading}
                  variant="secondary"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Continue as Listener'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={logout} className="text-sm">
              Sign out instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectRolePage;