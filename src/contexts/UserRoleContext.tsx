
import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'talker' | 'listener';

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isListener: boolean;
  isTalker: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('talker');

  return (
    <UserRoleContext.Provider value={{
      userRole,
      setUserRole,
      isListener: userRole === 'listener',
      isTalker: userRole === 'talker'
    }}>
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
