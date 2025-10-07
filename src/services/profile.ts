import axios from 'axios';
import { authService } from './auth';

const API_BASE_URL = 'https://ventoutserver.onrender.com';

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
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
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await authService.getToken();
        if (token) {
          if (!config.headers) config.headers = {} as any;
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await this.apiClient.get('/user/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await this.apiClient.patch('/user/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
}

export const profileService = new ProfileService();
