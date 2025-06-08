
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type UserRole = 'talker' | 'listener' | null;

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isListener: boolean;
  isTalker: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();

  const userRole = profile?.role || null;
  
  // This is now read-only from the database
  const setUserRole = (role: UserRole) => {
    console.log('Role setting is now handled through authentication');
  };

  return (
    <UserRoleContext.Provider 
      value={{
        userRole,
        setUserRole,
        isListener: userRole === 'listener',
        isTalker: userRole === 'talker'
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
