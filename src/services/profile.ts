import { supabase } from '@/integrations/supabase/app-client';

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  bio?: string;
  role?: string;
  createdAt?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, bio, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      id: user.id,
      email: user.email ?? undefined,
      displayName: profile?.display_name ?? undefined,
      bio: profile?.bio ?? undefined,
      createdAt: profile?.created_at ?? undefined,
    };
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        bio: data.bio,
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return this.getProfile();
  }
}

export const profileService = new ProfileService();
