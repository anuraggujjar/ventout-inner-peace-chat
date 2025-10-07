
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Settings, LogOut, Shield, Edit3, Save, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '@/contexts/SecurityContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profile';

const UserProfile = () => {
  const navigate = useNavigate();
  const { sessionId, clearSession } = useSecurity();
  const { toast } = useToast();
  const { logout } = useAuth();
  
  // Profile state
  const [displayName, setDisplayName] = useState('Anonymous User');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempBio, setTempBio] = useState(bio);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  // Fetch user profile from server only when dialog is opened
  const fetchProfile = async () => {
    try {
      setIsFetching(true);
      const profile = await profileService.getProfile();
      setDisplayName(profile.displayName || 'Anonymous User');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setCreatedAt(profile.createdAt || new Date().toISOString());
      setTempDisplayName(profile.displayName || 'Anonymous User');
      setTempBio(profile.bio || '');
      setHasLoadedProfile(true);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearSession();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = await profileService.updateProfile({
        displayName: tempDisplayName,
        bio: tempBio,
      });
      setDisplayName(updatedProfile.displayName || tempDisplayName);
      setBio(updatedProfile.bio || tempBio);
      setIsProfileDialogOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTempDisplayName(displayName);
    setTempBio(bio);
    setIsProfileDialogOpen(false);
  };

  const handleOpenProfile = async () => {
    setIsProfileDialogOpen(true);
    // Fetch profile data when opening the dialog for the first time or to refresh
    if (!hasLoadedProfile) {
      await fetchProfile();
    } else {
      setTempDisplayName(displayName);
      setTempBio(bio);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            User Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Profile</span>
            </DialogTitle>
            <DialogDescription>
              Update your profile information and bio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-display-name">Display Name</Label>
              <Input
                id="dialog-display-name"
                value={tempDisplayName}
                onChange={(e) => setTempDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-email">Email</Label>
              <Input
                id="dialog-email"
                type="email"
                value={email}
                readOnly
                className="bg-muted"
                placeholder="No email provided"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-phone">Phone Number</Label>
              <Input
                id="dialog-phone"
                type="tel"
                value={phone}
                readOnly
                className="bg-muted"
                placeholder="No phone provided"
              />
              <p className="text-xs text-muted-foreground">Phone cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-bio">Bio</Label>
              <Textarea
                id="dialog-bio"
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
            <div className="pt-2">
              {createdAt && (
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
