
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Mail, Phone, Edit, User, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const UserProfile = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bio, setBio] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveProfile = () => {
    console.log("Profile saved:", { dateOfBirth, email, contactNumber, bio });
    alert("Profile saved successfully!");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <User className="mr-3 h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center text-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-foreground">
              <Mail className="mr-2 h-4 w-4" />
              Email ID
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact" className="flex items-center text-foreground">
              <Phone className="mr-2 h-4 w-4" />
              Contact Number
            </Label>
            <Input
              id="contact"
              type="tel"
              placeholder="Enter your contact number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center text-foreground">
              <Edit className="mr-2 h-4 w-4" />
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Write a little about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[100px] resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/300 characters
            </p>
          </div>
          
          <Button 
            onClick={handleSaveProfile}
            className="w-full mt-4 hover:bg-primary/90"
          >
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
