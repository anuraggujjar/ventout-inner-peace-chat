
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const AuthPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'talker' | 'listener'>('talker');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting');
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both email and password"
      });
      return;
    }

    setLoading(true);
    console.log('Signing in with:', email);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in failed:', error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Failed to sign in. Please check your credentials."
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both email and password"
      });
      return;
    }

    setLoading(true);
    console.log('Signing up with:', email, 'as', role);
    
    const { error } = await signUp(email, password, role);
    
    if (error) {
      console.error('Sign up failed:', error);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "Failed to create account. Please try again."
      });
    } else {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully."
      });
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome to VentOut</h1>
            <p className="text-muted-foreground">Your safe space to be heard</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                    <strong>Test Credentials:</strong><br />
                    Email: test@example.com<br />
                    Password: password123
                  </div>
                  <Button 
                    onClick={handleSignIn} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Choose your role and create your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Label>I want to:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer border-2 ${role === 'talker' ? 'border-primary' : 'border-muted'}`}
                        onClick={() => setRole('talker')}
                      >
                        <CardContent className="flex flex-col items-center p-4">
                          <MessageSquare className="h-8 w-8 text-primary mb-2" />
                          <span className="text-sm font-medium">Talk</span>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer border-2 ${role === 'listener' ? 'border-primary' : 'border-muted'}`}
                        onClick={() => setRole('listener')}
                      >
                        <CardContent className="flex flex-col items-center p-4">
                          <Headphones className="h-8 w-8 text-primary mb-2" />
                          <span className="text-sm font-medium">Listen</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                    />
                  </div>
                  <Button 
                    onClick={handleSignUp} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
