import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin } from '../services/mockApiService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_unused: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const storedUser = localStorage.getItem('nyumbasys_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('nyumbasys_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password_unused: string) => {
    const loggedInUser = await apiLogin(email, password_unused);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('nyumbasys_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nyumbasys_user');
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
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
