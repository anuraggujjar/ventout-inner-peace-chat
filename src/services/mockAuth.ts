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

// Mock users for testing
const MOCK_USERS = [
  {
    id: '1',
    email: 'listener@test.com',
    password: 'password123',
    name: 'Test Listener',
    role: 'listener' as const,
    bio: 'I love helping people',
    interests: ['mental health', 'anxiety', 'relationships']
  },
  {
    id: '2',
    email: 'talker@test.com',
    password: 'password123',
    name: 'Test Talker',
    role: 'talker' as const,
    bio: 'Looking for someone to talk to',
    interests: ['stress', 'work', 'life']
  }
];

class MockAuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const authData = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        bio: user.bio,
        interests: user.interests
      },
      token: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}-${Date.now()}`
    };

    // Store in localStorage for persistence
    localStorage.setItem('mock_auth_data', JSON.stringify(authData));
    
    return authData;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'listener' | 'talker';
    interests?: string[];
    bio?: string;
  }): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      id: `${Date.now()}`,
      ...data
    };

    const authData = {
      user: {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        name: newUser.name,
        bio: newUser.bio,
        interests: newUser.interests
      },
      token: `mock-token-${newUser.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${newUser.id}-${Date.now()}`
    };

    // Store in localStorage for persistence
    localStorage.setItem('mock_auth_data', JSON.stringify(authData));
    
    return authData;
  }

  async getStoredUser(): Promise<User | null> {
    const stored = localStorage.getItem('mock_auth_data');
    if (!stored) return null;
    
    try {
      const authData = JSON.parse(stored);
      return authData.user;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const stored = localStorage.getItem('mock_auth_data');
    return !!stored;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mock_auth_data');
  }
}

export const mockAuthService = new MockAuthService();