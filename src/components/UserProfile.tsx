
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Settings, LogOut, Shield, Edit3, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '@/contexts/SecurityContext';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const { sessionId, clearSession } = useSecurity();
  const { toast } = useToast();
  
  // Profile state
  const [displayName, setDisplayName] = useState('Anonymous User');
  const [bio, setBio] = useState('Welcome to my mental health journey. I\'m here to find support and share experiences in a safe space.');
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempBio, setTempBio] = useState(bio);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    console.log('User logged out, session cleared');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleSaveProfile = () => {
    setDisplayName(tempDisplayName);
    setBio(tempBio);
    setIsProfileDialogOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleCancelEdit = () => {
    setTempDisplayName(displayName);
    setTempBio(bio);
    setIsProfileDialogOpen(false);
  };

  const handleOpenProfile = () => {
    setTempDisplayName(displayName);
    setTempBio(bio);
    setIsProfileDialogOpen(true);
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
            <p className="text-xs text-muted-foreground truncate">Session: {sessionId.slice(-8)}</p>
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
            Clear Session
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
