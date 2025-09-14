import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  currentConvoId: string | null;
  currentRoomId: string | null;
  setChatSession: (convoId: string, roomId: string) => void;
  clearChatSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(localStorage.getItem('currentConvoId'));
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(localStorage.getItem('currentRoomId'));

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Set up auth state listener first
      const { data: { subscription } } = authService.onAuthStateChange((user) => {
        setUser(user);
      });

      // Then check for existing session
      const [isAuth, storedUser] = await Promise.all([
        authService.isAuthenticated(),
        authService.getStoredUser(),
      ]);

      if (isAuth && storedUser) {
        setUser(storedUser);
      }

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const storedUser = await authService.getStoredUser();
    setUser(storedUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      clearChatSession();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setChatSession = (convoId: string, roomId: string) => {
    localStorage.setItem('currentConvoId', convoId);
    localStorage.setItem('currentRoomId', roomId);
    setCurrentConvoId(convoId);
    setCurrentRoomId(roomId);
  };

  const clearChatSession = () => {
    localStorage.removeItem('currentConvoId');
    localStorage.removeItem('currentRoomId');
    setCurrentConvoId(null);
    setCurrentRoomId(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
    currentConvoId,
    currentRoomId,
    setChatSession,
    clearChatSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};