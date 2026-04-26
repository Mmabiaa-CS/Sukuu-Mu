'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthContextType } from './types';
import { mockUsers } from './mock-data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('school_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('school_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - find user in mock data
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Remove password before storing
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('school_user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_user');
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address'>>) => {
    setUser((prevUser) => {
      if (!prevUser) {
        throw new Error('No active user session');
      }
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('school_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No active user session');
    }

    const matchingMockUser = mockUsers.find((u) => u.email === user.email);
    if (!matchingMockUser || matchingMockUser.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
