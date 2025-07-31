import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role?: 'talker' | 'listener';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:3000';

  // Store tokens securely
  const setTokens = (accessToken: string, refreshToken: string) => {
    // Store access token in memory (or could use HTTP-only cookie)
    sessionStorage.setItem('accessToken', accessToken);
    // Store refresh token securely
    localStorage.setItem('refreshToken', refreshToken);
  };

  const getAccessToken = () => sessionStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');

  const clearTokens = () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    clearTokens();
    return null;
  };

  // Make authenticated requests
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    let accessToken = getAccessToken();
    
    // Try to refresh token if no access token
    if (!accessToken) {
      accessToken = await refreshAccessToken();
      if (!accessToken) throw new Error('No valid token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      if (accessToken) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    }

    return response;
  };

  const checkAuthStatus = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/auth/me`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Role-based redirect
        if (userData.role === 'talker') {
          navigate('/talker/home');
        } else if (userData.role === 'listener') {
          navigate('/listener/home');
        } else {
          navigate('/select-role');
        }
      } else {
        setUser(null);
        clearTokens();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        await checkAuthStatus();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkAuthStatus
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