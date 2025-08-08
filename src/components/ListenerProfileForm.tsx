import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { listenerAPI, ListenerProfile } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Clock, User, Save, Loader2 } from 'lucide-react';

const listenerProfileSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  availability: z.object({
    days: z.array(z.string()).min(1, 'Please select at least one day'),
    timeSlots: z.array(z.string()).min(1, 'Please select at least one time slot')
  }),
  isActive: z.boolean()
});

type ListenerProfileFormData = z.infer<typeof listenerProfileSchema>;

const INTEREST_OPTIONS = [
  'Mental Health', 'Anxiety', 'Depression', 'Relationships', 'Work Stress',
  'Family Issues', 'Academic Pressure', 'Social Anxiety', 'Self-Esteem',
  'Grief & Loss', 'Life Transitions', 'Substance Abuse', 'LGBTQ+ Support',
  'Teen Issues', 'Parenting', 'General Support'
];

const DAY_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOT_OPTIONS = [
  'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)',
  'Evening (5-8 PM)', 'Night (8-11 PM)', 'Late Night (11 PM-2 AM)'
];

const ListenerProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<ListenerProfile | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ListenerProfileFormData>({
    resolver: zodResolver(listenerProfileSchema),
    defaultValues: {
      bio: '',
      interests: [],
      availability: {
        days: [],
        timeSlots: []
      },
      isActive: true
    }
  });

  const watchedInterests = watch('interests');
  const watchedDays = watch('availability.days');
  const watchedTimeSlots = watch('availability.timeSlots');

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await listenerAPI.getMyProfile();
        if (profile) {
          setExistingProfile(profile);
          setValue('bio', profile.bio);
          setValue('interests', profile.interests);
          setValue('availability', profile.availability);
          setValue('isActive', profile.isActive);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ListenerProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        ...data,
        userId: user.id
      };

      await listenerAPI.saveProfile(profileData);
      
      toast({
        title: "Profile Saved",
        description: "Your listener profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const current = watchedInterests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setValue('interests', updated);
  };

  const handleDayToggle = (day: string) => {
    const current = watchedDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setValue('availability.days', updated);
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    const current = watchedTimeSlots || [];
    const updated = current.includes(timeSlot)
      ? current.filter(t => t !== timeSlot)
      : [...current, timeSlot];
    setValue('availability.timeSlots', updated);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-500" />
            Listener Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete your profile to start helping others. This information helps us match you with people who need support.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bio Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                About You
              </label>
              <Textarea
                {...register('bio')}
                placeholder="Tell people about yourself, your experience, and why you want to listen. This helps create trust and connection."
                className="min-h-[120px]"
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch('bio')?.length || 0}/500 characters
              </p>
            </div>

            {/* Interests Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Areas of Support (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <div
                    key={interest}
                    className={`p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                      watchedInterests?.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </div>
                ))}
              </div>
              {errors.interests && (
                <p className="text-sm text-red-500">{errors.interests.message}</p>
              )}
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Availability
              </label>
              
              {/* Days */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Days of the week</p>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => (
                    <Badge
                      key={day}
                      variant={watchedDays?.includes(day) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
                {errors.availability?.days && (
                  <p className="text-sm text-red-500">{errors.availability.days.message}</p>
                )}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Preferred time slots</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TIME_SLOT_OPTIONS.map((timeSlot) => (
                    <div
                      key={timeSlot}
                      className={`p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                        watchedTimeSlots?.includes(timeSlot)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                      onClick={() => handleTimeSlotToggle(timeSlot)}
                    >
                      {timeSlot}
                    </div>
                  ))}
                </div>
                {errors.availability?.timeSlots && (
                  <p className="text-sm text-red-500">{errors.availability.timeSlots.message}</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                I'm currently available to listen and help others
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingProfile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListenerProfileForm;