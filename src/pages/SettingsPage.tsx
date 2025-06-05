
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, Eye, Trash2, Download, User, Edit3, Save, X } from 'lucide-react';
import { useSecurity } from '@/contexts/SecurityContext';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { sessionId, isSecureConnection, clearSession } = useSecurity();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoDelete, setAutoDelete] = useState(true);
  
  // User profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('Anonymous User');
  const [bio, setBio] = useState('Welcome to my mental health journey. I\'m here to find support and share experiences in a safe space.');
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempBio, setTempBio] = useState(bio);

  const handleClearData = () => {
    clearSession();
    toast({
      title: "Data Cleared",
      description: "All local data has been cleared successfully.",
    });
  };

  const handleExportData = () => {
    const data = {
      sessionId,
      userProfile: {
        displayName,
        bio,
        joinDate: new Date().toISOString()
      },
      preferences: {
        notifications,
        analytics,
        autoDelete
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventout-data-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, privacy and preferences</p>
        </div>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Profile</span>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardTitle>
            <CardDescription>Your profile information and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {tempBio.length}/500 characters
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                </div>
                <div>
                  <p className="text-sm text-foreground mb-2">{bio}</p>
                  <p className="text-xs text-muted-foreground">Bio</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm font-medium">Session ID</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {sessionId.slice(-12)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                  {isSecureConnection ? 'Secure HTTPS connection' : 'Insecure connection'}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                isSecureConnection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isSecureConnection ? 'Secure' : 'Insecure'}
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

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve Sola with anonymous usage data
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-delete">Auto-delete Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically delete messages after 24 hours
                </p>
              </div>
              <Switch
                id="auto-delete"
                checked={autoDelete}
                onCheckedChange={setAutoDelete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>Manage your stored data and chat history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clearing data will remove all chat history and preferences from this device.
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
