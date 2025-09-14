import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'talker' | 'listener';
  bio?: string;
  interests?: string[];
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'talker' | 'listener';
  bio?: string;
  interests?: string[];
}

export interface PhoneOTPData {
  phone: string;
}

export interface VerifyOTPData {
  phone: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  session: any;
}

class AuthService {
  private readonly STORAGE_KEY = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    const user = await this.fetchUserProfile(data.user.id);
    this.storeUser(user);

    return { user, session: data.session };
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: registerData.name,
          role: registerData.role,
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        display_name: registerData.name,
        role: registerData.role,
      });

    if (profileError) throw profileError;

    const user = await this.fetchUserProfile(data.user.id);
    this.storeUser(user);

    return { user, session: data.session };
  }

  async googleLogin(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });

    if (error) throw error;

    // This will be handled by the auth state change listener
    throw new Error('Google login initiated - redirect in progress');
  }

  async sendOTP(phoneData: PhoneOTPData): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneData.phone,
    });

    if (error) throw error;
  }

  async verifyOTP(verifyData: VerifyOTPData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: verifyData.phone,
      token: verifyData.code,
      type: 'sms',
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    const user = await this.fetchUserProfile(data.user.id);
    this.storeUser(user);

    return { user, session: data.session };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async getStoredUser(): Promise<User | null> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private async fetchUserProfile(userId: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profile) throw new Error('Profile not found');

    return {
      id: profile.id,
      email: '', // Will be filled by auth state change
      name: profile.display_name,
      role: profile.role as 'talker' | 'listener',
      createdAt: profile.created_at,
    };
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  // Handle auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.fetchUserProfile(session.user.id)
          .then(user => {
            user.email = session.user.email || '';
            this.storeUser(user);
            callback(user);
          })
          .catch(console.error);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(this.STORAGE_KEY);
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();