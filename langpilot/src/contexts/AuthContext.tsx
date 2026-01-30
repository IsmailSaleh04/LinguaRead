'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import type { User } from '@/lib/types';
import { languagesApi } from '@/lib/api/languages';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nativeLanguage: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        await checkOnboarding();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const checkOnboarding = async (): Promise<boolean> => {
    try {
      // Check if user has any target languages
      const response = await languagesApi.getTargetLanguages();
      const hasLanguages = response.success && response.data && response.data.length > 0;
      setNeedsOnboarding(!hasLanguages);
      return !hasLanguages;
    } catch (error) {
      console.error('Failed to check onboarding:', error);
      return false;
    }
  };


  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      await checkOnboarding();
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, nativeLanguage: string) => {
    const response = await authApi.register({ email, password, nativeLanguage });
    if (response.success && response.data) {
      setUser(response.data.user);
      setNeedsOnboarding(true);
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setNeedsOnboarding(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    needsOnboarding,
    login,
    register,
    logout,
    refreshUser,
    checkOnboarding,
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
