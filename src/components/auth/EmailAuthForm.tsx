import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  isListener: z.boolean(),
  bio: z.string().optional(),
  interests: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const EmailAuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isListener: false,
    },
  });

  const isListener = registerForm.watch('isListener');

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const authData = await authService.login({
        email: data.email,
        password: data.password,
      });
      await refreshUser();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      if (authData.user.role === 'listener') {
        navigate('/listener/home');
      } else {
        navigate('/topic-selection');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.isListener ? 'listener' as const : 'talker' as const,
        bio: data.isListener ? data.bio : undefined,
        interests: data.isListener && data.interests 
          ? data.interests.split(',').map(i => i.trim()) 
          : undefined,
      };

      const authData = await authService.register(registerData);
      await refreshUser();
      
      toast({
        title: "Registration successful",
        description: "Welcome to the platform!",
      });

      if (authData.user.role === 'listener') {
        navigate('/listener/home');
      } else {
        navigate('/topic-selection');
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  placeholder="Enter your full name"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-listener"
                  checked={isListener}
                  onCheckedChange={(checked) => 
                    registerForm.setValue('isListener', !!checked)
                  }
                />
                <Label htmlFor="is-listener" className="text-sm">
                  I am a Listener (provides support to others)
                </Label>
              </div>
              
              {isListener && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself and your experience..."
                      rows={3}
                      {...registerForm.register('bio')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interests">Areas of Interest</Label>
                    <Input
                      id="interests"
                      placeholder="e.g., anxiety, depression, relationships (comma-separated)"
                      {...registerForm.register('interests')}
                    />
                  </div>
                </>
              )}
              
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};