import axios from 'axios';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'https://ventoutserver.onrender.com';

const GOOGLE_WEB_CLIENT_ID = ''; // Empty for now - will be configured later

export interface User {
  id: string;
  _id?: string;
  role: 'listener' | 'talker';
  email: string;
  name?: string;
  phone?: string;
  bio?: string;
  interests?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
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

export interface OTPSendData {
  phone: string;
}

export interface OTPVerifyData {
  phone: string;
  code: string;
}

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // This promise prevents multiple refresh calls from running at once.
  private isRefreshingPromise: Promise<string | null> | null = null;
  private googleGisReady = false;

  constructor() {
    this.setupInterceptors();
    // Initialize Google Auth async to prevent blocking constructor
    this.initializeGoogleAuth().catch(error => {
      console.warn('Google Auth initialization failed:', error);
      // Continue without Google Auth
    });
  }

  private async initializeGoogleAuth() {
    try {
      if (!GOOGLE_WEB_CLIENT_ID) {
        console.warn('Google Client ID not configured, skipping Google Auth initialization');
        return;
      }

      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.initialize({
          clientId: GOOGLE_WEB_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } else {
        await this.loadGoogleGisSDK();
      }
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      throw error;
    }
  }

  private loadGoogleGisSDK(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.googleGisReady = true;
        resolve();
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services SDK.");
        resolve();
      }
      document.head.appendChild(script);
    });
  }

  public async getToken(): Promise<string | null> {
    // If a refresh is already in progress, all subsequent calls wait for it.
    if (this.isRefreshingPromise) {
        console.log('Refresh already in progress, waiting for it to resolve.');
        return await this.isRefreshingPromise;
    }

    let accessToken = await this.getStoredToken();

    if (!accessToken) {
        return null;
    }

    try {
        const decodedToken: { exp: number } = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime + 300) {
            return accessToken;
        }

        console.log('Access token is expired or close to expiration. Attempting to refresh...');

        // Start the refresh and store the promise.
        this.isRefreshingPromise = this.refreshAccessToken();
        
        const newToken = await this.isRefreshingPromise;
        // The refresh is complete, so we clear the promise.
        this.isRefreshingPromise = null;
        return newToken;

    } catch (error) {
        console.error('Invalid token found in storage or refresh failed. Logging out.');
        this.logout();
        this.isRefreshingPromise = null; // Also clear the promise on error
        return null;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = await this.getStoredRefreshToken();
        if (!refreshToken) {
            return null;
        }

        const response = await this.apiClient.post('/auth/refresh', {
            refreshToken,
        });

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;
        await this.storeToken(newAccessToken);
        await Preferences.set({ key: 'refresh_token', value: newRefreshToken });

        return newAccessToken;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null;
    }
  }
  
  private setupInterceptors() {
    this.apiClient.interceptors.request.use(
        async (config) => {
            const token = await this.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
  }

  async googleLogin(): Promise<AuthResponse> {
    try {
      if (!GOOGLE_WEB_CLIENT_ID) {
        throw new Error('Google Client ID not configured. Please contact support.');
      }

      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        
        if (!googleUser.authentication?.idToken) {
          throw new Error('Failed to get Google ID token from native auth');
        }
        
        const idToken = googleUser.authentication.idToken;

        const response = await this.apiClient.post('/auth/google/callback', {
          tokenId: idToken,
        });
        
        const authData: AuthResponse = response.data;
        await this.storeAuthData(authData);
        
        return authData;
      } else {
        if (!this.googleGisReady) {
          throw new Error('Google Identity Services SDK is not loaded.');
        }

        return new Promise((resolve, reject) => {
          const client = google.accounts.oauth2.initCodeClient({
            client_id: GOOGLE_WEB_CLIENT_ID,
            scope: 'openid email profile',
            ux_mode: 'popup',
            callback: async (response: any) => {
              if (response.error) {
                reject(new Error(`Google login failed: ${response.error} - ${response.error_description}`));
                return;
              }
              try {
                const apiResponse = await this.apiClient.post('/auth/google/callback', {
                  code: response.code,
                });
                
                const authData: AuthResponse = apiResponse.data;
                await this.storeAuthData(authData);
                resolve(authData);

              } catch (error: any) {
                reject(new Error(error.response?.data?.message || 'Google login failed'));
              }
            },
          });
          client.requestCode();
        });
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Google login failed');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/login', credentials);
      const authData: AuthResponse = response.data;
      await this.storeAuthData(authData);
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/register', data);
      const authData: AuthResponse = response.data;
      await this.storeAuthData(authData);
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async sendOTP(data: OTPSendData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/auth/otp/send', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  }

  async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/otp/verify', data);
      const authData: AuthResponse = response.data;
      await this.storeAuthData(authData);
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    const userToStore = {
      ...authData.user,
      id: authData.user.id || authData.user._id,
    };
    
    await Promise.all([
      Preferences.set({ key: 'auth_token', value: authData.token }),
      Preferences.set({ key: 'refresh_token', value: authData.refreshToken }),
      Preferences.set({ key: 'user_data', value: JSON.stringify(userToStore) }),
    ]);
  }

  private async storeToken(token: string): Promise<void> {
    await Preferences.set({ key: 'auth_token', value: token });
  }

  async getStoredToken(): Promise<string | null> {
    const result = await Preferences.get({ key: 'auth_token' });
    return result.value;
  }

  private async getStoredRefreshToken(): Promise<string | null> {
    const result = await Preferences.get({ key: 'refresh_token' });
    return result.value;
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const result = await Preferences.get({ key: 'user_data' });
      return result.value ? JSON.parse(result.value) : null;
    } catch {
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: 'auth_token' }),
      Preferences.remove({ key: 'refresh_token' }),
      Preferences.remove({ key: 'user_data' }),
    ]);
  }

  async logout(): Promise<void> {
    await this.clearTokens();
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      } else {
        if (typeof google !== 'undefined' && google.accounts.id) {
          google.accounts.id.disableAutoSelect();
        }
      }
    } catch {
      // Ignore Google signout errors
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

}

export const authService = new AuthService();