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
      const accessToken = getAccessToken();
      
      if (accessToken && accessToken.startsWith('mock_access_token_')) {
        // Extract user ID from mock token
        const userId = accessToken.split('_').pop();
        const dummyUsers = [
          { email: 'talker@test.com', id: '1', role: 'talker' as const },
          { email: 'listener@test.com', id: '2', role: 'listener' as const },
          { email: 'admin@test.com', id: '3', role: 'talker' as const }
        ];
        
        const userData = dummyUsers.find(u => u.id === userId);
        
        if (userData) {
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
          navigate('/login');
        }
      } else {
        setUser(null);
        clearTokens();
        navigate('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      clearTokens();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Dummy credentials for testing
    const dummyUsers = [
      { email: 'talker@test.com', password: 'password123', id: '1', role: 'talker' as const },
      { email: 'listener@test.com', password: 'password123', id: '2', role: 'listener' as const },
      { email: 'admin@test.com', password: 'admin123', id: '3', role: 'talker' as const }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = dummyUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Simulate tokens
      const mockTokens = {
        accessToken: `mock_access_token_${user.id}`,
        refreshToken: `mock_refresh_token_${user.id}`
      };
      
      setTokens(mockTokens.accessToken, mockTokens.refreshToken);
      setUser({ id: user.id, email: user.email, role: user.role });
      
      // Role-based redirect
      if (user.role === 'talker') {
        navigate('/talker/home');
      } else if (user.role === 'listener') {
        navigate('/listener/home');
      } else {
        navigate('/select-role');
      }
    } else {
      throw new Error('Invalid email or password');
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