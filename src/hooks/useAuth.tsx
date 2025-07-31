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
      
      if (accessToken) {
        // Mock user data based on token
        const mockUsers = {
          'mock_access_token_1': { id: '1', email: 'talker@test.com', role: 'talker' as const },
          'mock_access_token_2': { id: '2', email: 'listener@test.com', role: 'listener' as const }
        };

        const userData = mockUsers[accessToken as keyof typeof mockUsers];
        
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
    // Mock login with dummy credentials
    const mockUsers = {
      'talker@test.com': { id: '1', email: 'talker@test.com', role: 'talker' as const, password: 'test123' },
      'listener@test.com': { id: '2', email: 'listener@test.com', role: 'listener' as const, password: 'test123' }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = mockUsers[email as keyof typeof mockUsers];
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Mock tokens
    const mockTokens = {
      accessToken: `mock_access_token_${mockUser.id}`,
      refreshToken: `mock_refresh_token_${mockUser.id}`
    };

    setTokens(mockTokens.accessToken, mockTokens.refreshToken);
    setUser({ id: mockUser.id, email: mockUser.email, role: mockUser.role });
    
    // Role-based redirect
    if (mockUser.role === 'talker') {
      navigate('/talker/home');
    } else if (mockUser.role === 'listener') {
      navigate('/listener/home');
    } else {
      navigate('/select-role');
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