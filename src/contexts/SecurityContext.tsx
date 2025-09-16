
import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateAnonymousId, clearSensitiveData } from '@/utils/privacy';

interface SecurityContextType {
  sessionId: string;
  isSecureConnection: boolean;
  clearSession: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isSecureConnection, setIsSecureConnection] = useState<boolean>(false);

  useEffect(() => {
    // Generate anonymous session ID
    const existingSessionId = localStorage.getItem('sessionId');
    if (!existingSessionId) {
      const newSessionId = generateAnonymousId();
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
    } else {
      setSessionId(existingSessionId);
    }

    // Check if connection is secure
    setIsSecureConnection(location.protocol === 'https:');

    // Clear session data on page unload
    const handleBeforeUnload = () => {
      localStorage.removeItem('sessionId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const clearSession = () => {
    localStorage.removeItem('sessionId');
    const newSessionId = generateAnonymousId();
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
  };

  return (
    <SecurityContext.Provider value={{ sessionId, isSecureConnection, clearSession }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
