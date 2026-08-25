'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  username: string;
  initial: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('poulpy_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('poulpy_users') || '{}');
    const userData = users[email];

    if (!userData || userData.password !== password) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const userObj = {
      email: userData.email,
      username: userData.username,
      initial: userData.username.charAt(0).toUpperCase(),
    };

    setUser(userObj);
    localStorage.setItem('poulpy_user', JSON.stringify(userObj));
  };

  const register = async (email: string, username: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('poulpy_users') || '{}');

    if (users[email]) {
      throw new Error('Cet email est déjà utilisé');
    }

    const userData = { email, username, password };
    users[email] = userData;
    localStorage.setItem('poulpy_users', JSON.stringify(users));

    const userObj = {
      email,
      username,
      initial: username.charAt(0).toUpperCase(),
    };

    setUser(userObj);
    localStorage.setItem('poulpy_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('poulpy_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}