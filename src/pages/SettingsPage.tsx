
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, LogOut, Moon, Camera, User } from 'lucide-react';

const SettingsPage = () => {
  const [profileData, setProfileData] = useState({
    profilePhoto: '',
    dateOfBirth: '',
    email: '',
    contactNumber: '',
    bio: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`${field} updated:`, value);
  };

  const handleProfilePhotoUpload = () => {
    console.log("Profile photo upload clicked - integrate with file upload");
    alert("Profile photo upload requires backend integration.");
  };

  const handleSaveProfile = () => {
    console.log("Save profile clicked", profileData);
    alert("Profile save functionality requires Supabase integration.");
  };

  const handleClearAll = () => {
    setProfileData({
      profilePhoto: '',
      dateOfBirth: '',
      email: '',
      contactNumber: '',
      bio: ''
    });
    console.log("Profile data cleared");
  };

  const handleToggleDarkMode = () => console.log("Toggle Dark Mode (coming soon)");
  const handleNotifications = () => console.log("Notification settings (coming soon)");
  const handleLogout = () => {
    console.log("Logout clicked - integrate with Supabase auth");
    alert("Logout functionality requires Supabase integration.");
  };

  return (
    <Layout>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
        
        {/* Profile Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <User className="h-6 w-6" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20 hover:border-primary/40 transition-colors">
                <AvatarImage src={profileData.profilePhoto} alt="Profile" />
                <AvatarFallback className="text-2xl bg-secondary">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                onClick={handleProfilePhotoUpload}
                className="hover:bg-primary/10"
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={profileData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-[100px] hover:border-primary/50 focus:border-primary transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {profileData.bio.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveProfile} 
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Save Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark Mode</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleDarkMode} 
                className="flex items-center hover:bg-primary/10"
              >
                <Moon className="mr-2 h-4 w-4" /> 
                Toggle (Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Daily Quote Notifications</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNotifications} 
                className="hover:bg-primary/10"
              >
                Enable/Disable (Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
            >
              <FileText className="mr-3 h-5 w-5" /> 
              Terms of Use (Coming Soon)
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
            >
              <Shield className="mr-3 h-5 w-5" /> 
              Privacy Policy (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full hover:bg-destructive/90 hover:shadow-destructive/25" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" /> 
              Logout (Needs Supabase)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Login/Signup and account management will be available after Supabase integration.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
