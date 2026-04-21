"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "@/lib/api/auth";
import type { User } from "@/lib/types";
import { languagesApi } from "@/lib/api/languages";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nativeLanguage: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkOnboarding: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  // Returns true when user still needs onboarding, false otherwise.
  // On any error we return false and leave needsOnboarding unchanged so
  // a transient network failure never traps the user in a redirect loop.
  const checkOnboarding = async (): Promise<boolean> => {
    try {
      const response = await languagesApi.getTargetLanguages();
      const hasLanguages =
        response.success && response.data && response.data.length > 0;
      const needs = !hasLanguages;
      setNeedsOnboarding(needs);
      return needs;
    } catch (error) {
      console.error("Failed to check onboarding:", error);
      // Do NOT flip needsOnboarding to true on error — keep existing value
      return false;
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        // Single checkOnboarding call during load
        await checkOnboarding();
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      // checkOnboarding is NOT called here — loadUser already handles it
      // on the initial mount, and after login we navigate away immediately.
      // Call it once explicitly so the redirect to /onboarding still works.
      await checkOnboarding();
    } else {
      throw new Error(response.error || "Login failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    nativeLanguage: string,
  ) => {
    const response = await authApi.register({
      email,
      password,
      nativeLanguage,
    });
    if (response.success && response.data) {
      setUser(response.data.user);
      // Brand-new user always needs onboarding
      setNeedsOnboarding(true);
    } else {
      throw new Error(response.error || "Registration failed");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
