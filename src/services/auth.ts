import axios from 'axios';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const API_BASE_URL = 'http://localhost:3000'; // Backend URL

// Google Web Client ID - replace with your actual client ID
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

export interface User {
  id: string;
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

  constructor() {
    this.setupInterceptors();
    this.initializeGoogleAuth();
  }

  private async initializeGoogleAuth() {
    if (Capacitor.isNativePlatform()) {
      // Initialize for native platforms
      await GoogleAuth.initialize({
        clientId: GOOGLE_WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } else {
      // Initialize for web platform
      await this.loadGoogleWebSDK();
    }
  }

  private loadGoogleWebSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', {
          callback: () => {
            window.gapi.auth2.init({
              client_id: GOOGLE_WEB_CLIENT_ID,
              scope: 'profile email'
            }).then(() => {
              resolve();
            }).catch(reject);
          },
          onerror: reject
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          
          try {
            const refreshToken = await this.getStoredRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              
              const { token } = response.data;
              await this.storeToken(token);
              
              return this.apiClient(original);
            }
          } catch (refreshError) {
            await this.clearTokens();
            window.location.href = '/auth';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Google Authentication
  async googleLogin(): Promise<AuthResponse> {
    try {
      let idToken: string;

      if (Capacitor.isNativePlatform()) {
        // Native platform (iOS/Android)
        const googleUser = await GoogleAuth.signIn();
        
        if (!googleUser.authentication?.idToken) {
          throw new Error('Failed to get Google ID token from native auth');
        }
        
        idToken = googleUser.authentication.idToken;
      } else {
        // Web platform
        await this.loadGoogleWebSDK();
        const authInstance = window.gapi.auth2.getAuthInstance();
        
        if (!authInstance) {
          throw new Error('Google Auth not properly initialized');
        }

        const googleUser = await authInstance.signIn({
          scope: 'profile email'
        });
        
        idToken = googleUser.getAuthResponse().id_token;
        
        if (!idToken) {
          throw new Error('Failed to get Google ID token from web auth');
        }
      }

      const response = await this.apiClient.post('/auth/google/callback', {
        tokenId: idToken,
      });

      const authData: AuthResponse = response.data;
      await this.storeAuthData(authData);
      
      return authData;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Google login failed');
    }
  }

  // Email/Password Authentication
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

  // Phone OTP Authentication
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

  // Token Management
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    await Promise.all([
      Preferences.set({ key: 'auth_token', value: authData.token }),
      Preferences.set({ key: 'refresh_token', value: authData.refreshToken }),
      Preferences.set({ key: 'user_data', value: JSON.stringify(authData.user) }),
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
        const authInstance = window.gapi?.auth2?.getAuthInstance();
        if (authInstance) {
          await authInstance.signOut();
        }
      }
    } catch {
      // Ignore Google signout errors
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export const authService = new AuthService();