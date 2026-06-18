// components/providers/AuthContext.tsx
'use client'; // This component relies on React Hooks and state

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  // You would add functions here for login, logout, etc.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/** 
 * Replaces the Provider wrapper that would have been in pages/_app.tsx.
 */
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulates checking session status on mount
  useEffect(() => {
    // In a real app: Call an API endpoint (e.g., /api/auth/me) to check the session token validity
    setTimeout(() => {
      setUser({ name: "Placeholder User" }); // Mocking success after login
      setIsLoading(false);
    }, 1000);
  }, []);

  const contextValue = {
    user,
    isAuthenticated: !!user || !isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};