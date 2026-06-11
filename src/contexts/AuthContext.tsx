import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
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

  const loadUser = async () => {
    try {
      const u = await authService.getStoredUser();
      setUser(u);
      return u;
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Set up the auth listener BEFORE fetching the session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        // Defer Supabase calls to avoid deadlock inside the callback.
        setTimeout(() => { void loadUser(); }, 0);
      }
    });

    (async () => {
      await loadUser();
      setIsLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => loadUser();

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

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      logout,
      refreshUser,
      currentConvoId,
      currentRoomId,
      setChatSession,
      clearChatSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
