import axios from 'axios';
import { authService } from './auth';

// Backend API base URL
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.com' 
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using stored refresh token
        // Note: You'll need to implement refreshToken method in authService
        const newToken = authService.getStoredToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await authService.logout();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Listener Profile API
export interface ListenerProfile {
  id?: string;
  userId: string;
  bio: string;
  interests: string[];
  availability: {
    days: string[];
    timeSlots: string[];
  };
  rating?: number;
  totalSessions?: number;
  isActive: boolean;
}

export const listenerAPI = {
  // Create or update listener profile
  saveProfile: async (profile: Omit<ListenerProfile, 'id'>): Promise<ListenerProfile> => {
    const response = await api.post('/api/listeners', profile);
    return response.data;
  },

  // Get current user's listener profile
  getMyProfile: async (): Promise<ListenerProfile | null> => {
    try {
      const response = await api.get('/api/listeners/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No profile exists yet
      }
      throw error;
    }
  },

  // Get available listeners for talkers
  getAvailableListeners: async (): Promise<ListenerProfile[]> => {
    const response = await api.get('/api/listeners');
    return response.data;
  }
};

// Talkers API
export interface TalkerInfo {
  id: string;
  displayName: string;
  isOnline: boolean;
  waitingTime?: number;
  topic?: string;
  feeling?: string;
}

export const talkerAPI = {
  // Get available talkers for listeners
  getAvailableTalkers: async (): Promise<TalkerInfo[]> => {
    const response = await api.get('/api/talkers');
    return response.data;
  }
};

// Chat History API
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: 'listener' | 'talker';
  content?: string;
  audioData?: string;
  type: 'text' | 'voice';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  roomId: string;
  listenerId: string;
  talkerId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'ended';
  topic?: string;
  feeling?: string;
  rating?: number;
  feedback?: string;
}

export const chatAPI = {
  // Get chat history for current user
  getChatHistory: async (limit: number = 50, offset: number = 0): Promise<ChatSession[]> => {
    const response = await api.get('/api/chat/history', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get messages for a specific chat session
  getChatMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/chat/${roomId}/messages`);
    return response.data;
  },

  // Submit feedback for a chat session
  submitFeedback: async (roomId: string, rating: number, feedback?: string): Promise<void> => {
    await api.post(`/api/chat/${roomId}/feedback`, {
      rating,
      feedback
    });
  }
};

// Push notifications API
export const pushAPI = {
  // Register device for push notifications
  registerDevice: async (deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> => {
    await api.post('/api/devices', {
      deviceToken,
      platform
    });
  },

  // Unregister device
  unregisterDevice: async (deviceToken: string): Promise<void> => {
    await api.delete('/api/devices', {
      data: { deviceToken }
    });
  }
};

export default api;