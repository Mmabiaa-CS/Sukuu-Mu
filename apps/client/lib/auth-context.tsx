'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthContextType, UserRole } from './types';
import { apiClient } from './api-client';
import { useQueryClient } from '@tanstack/react-query';

// ── Token helpers (sessionStorage only — cleared when browser tab/session ends) ──
const TOKEN_KEY = 'sukuu_token';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') sessionStorage.setItem(TOKEN_KEY, token);
};

const clearStoredToken = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
    // Also clear any old localStorage keys in case they exist from previous versions
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
  }
};

// ── Helpers to map API response to User type ──────────────────────────────────
const mapApiUser = (userData: any): User => ({
  id: userData.id,
  email: userData.email,
  name: userData.name,
  firstName: (userData.name ?? '').split(' ')[0],
  lastName: (userData.name ?? '').split(' ').slice(1).join(' '),
  role: userData.role as UserRole,
  is_active: userData.is_active,
});

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── On mount: restore session from API using stored token ─────────────────
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Token exists — verify it with the API and fetch fresh user data
    apiClient
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.data;
        setUser(mapApiUser(userData));
      })
      .catch(() => {
        // Token is invalid/expired — clear it
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;

      // Store token (sessionStorage only — no user data persisted)
      setStoredToken(token);
      setUser(mapApiUser(userData));
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Cannot connect to server. Is it running?'
          : 'Invalid credentials');
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    // Cancel all in-flight queries so no 401 triggers the interceptor redirect
    queryClient.clear();
  }, [queryClient]);

  // ── Update profile (optimistic, no persistence beyond re-fetch) ───────────
  const updateProfile = useCallback(
    async (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address'>>) => {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    []
  );

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useCallback(
    async (current_password: string, new_password: string) => {
      if (!user) throw new Error('No active user session');
      try {
        await apiClient.patch('/auth/change-password', { current_password, new_password });
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
    },
    [user]
  );

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
