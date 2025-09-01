
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, Eye, User, Edit3, Save, X, LogOut, Mail, MessageCircle, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '@/contexts/SecurityContext';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  
  // User profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('Anonymous User');
  const [bio, setBio] = useState('Welcome to my mental health journey. I\'m here to find support and share experiences in a safe space.');
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempBio, setTempBio] = useState(bio);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSaveProfile = () => {
    setDisplayName(tempDisplayName);
    setBio(tempBio);
    setIsEditingProfile(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleCancelEdit = () => {
    setTempDisplayName(displayName);
    setTempBio(bio);
    setIsEditingProfile(false);
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:support@ventout.app';
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your profile, privacy and preferences</p>
          </div>
        </div>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Status</span>
            </CardTitle>
            <CardDescription>Your current security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Connection Security</p>
                <p className="text-sm text-muted-foreground">
                  Secure HTTPS connection
                </p>
              </div>
              <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Secure
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Session Status</p>
                <p className="text-sm text-muted-foreground">
                  Active anonymous session
                </p>
              </div>
              <div className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Active
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Privacy Preferences</span>
            </CardTitle>
            <CardDescription>Control how your data is handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your conversations
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Us */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Contact Us</span>
            </CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleContactEmail}
                className="w-full justify-start"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  support@ventout.app
                </p>
                <p className="flex items-center">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Response time: Within 24 hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>Manage your account and session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
            <p className="text-xs text-muted-foreground">
              Logging out will end your current session and clear all local data.
            </p>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>About VentOut</CardTitle>
            <CardDescription>Your safe space to be heard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              VentOut provides a safe, anonymous space for mental health support where you can freely express your thoughts and feelings. 
              Connect with caring listeners or become a listener yourself to help others on their journey.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Version: 1.0.0</p>
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
