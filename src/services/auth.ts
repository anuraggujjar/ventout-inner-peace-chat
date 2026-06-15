import { supabase } from '@/integrations/supabase/app-client';

export interface User {
  id: string;
  role: 'listener' | 'talker';
  email: string;
  name?: string;
  bio?: string;
  interests?: string[];
}

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'listener' | 'talker';
  interests?: string[];
  bio?: string;
}

class AuthService {
  /** Build the User shape the app expects from the current Supabase session. */
  private async hydrateUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('display_name, bio').eq('id', authUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', authUser.id),
    ]);

    const role: 'listener' | 'talker' =
      roles?.some((r) => r.role === 'listener') ? 'listener' : 'talker';

    let interests: string[] | undefined;
    if (role === 'listener') {
      const { data: details } = await supabase
        .from('listener_details')
        .select('interests')
        .eq('user_id', authUser.id)
        .maybeSingle();
      interests = details?.interests ?? [];
    }

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: profile?.display_name ?? authUser.user_metadata?.display_name ?? authUser.email?.split('@')[0],
      bio: profile?.bio ?? undefined,
      role,
      interests,
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw new Error(error.message);
    const user = await this.hydrateUser();
    if (!user) throw new Error('Failed to load user after login');
    return { user };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: data.name,
          role: data.role,
        },
      },
    });
    if (error) throw new Error(error.message);

    // If email confirmation is enabled, there's no session yet — guide caller.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Account created. Please check your email to confirm before logging in.');
    }

    // Update listener-specific fields if provided
    if (data.role === 'listener' && (data.bio || data.interests?.length)) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        if (data.bio) {
          await supabase.from('profiles').update({ bio: data.bio }).eq('id', authUser.id);
        }
        if (data.interests?.length) {
          await supabase
            .from('listener_details')
            .upsert({ user_id: authUser.id, interests: data.interests });
        }
      }
    }

    const user = await this.hydrateUser();
    if (!user) throw new Error('Failed to load user after registration');
    return { user };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getStoredUser(): Promise<User | null> {
    return this.hydrateUser();
  }

  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  async getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
}

export const authService = new AuthService();
