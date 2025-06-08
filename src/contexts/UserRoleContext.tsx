
import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'talker' | 'listener' | null;

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isListener: boolean;
  isTalker: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  return (
    <UserRoleContext.Provider value={{
      userRole,
      setUserRole: handleSetUserRole,
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
