"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { languagesApi } from "@/lib/api/languages";
import type { TargetLanguage, UserPreferences } from "@/lib/types";

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (code: string) => void;
  targetLanguages: TargetLanguage[];
  setTargetLanguages: (langs: TargetLanguage[]) => void;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>("en");
  const [targetLanguages, setTargetLanguages] = useState<TargetLanguage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize if the user has a token — avoids 401s on public pages
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setIsInitialized(true);
      return;
    }

    const initialize = async () => {
      try {
        // Run both requests in parallel
        const [prefsRes, targetsRes] = await Promise.all([
          languagesApi.getPreferences(),
          languagesApi.getTargetLanguages(),
        ]);

        let resolvedLanguage = "en";

        if (prefsRes.success && prefsRes.data) {
          const prefs = prefsRes.data as UserPreferences;
          if (prefs.current_language) {
            resolvedLanguage = prefs.current_language;
          }
        }

        if (targetsRes.success && targetsRes.data) {
          const targets = targetsRes.data;
          setTargetLanguages(targets);

          // If prefs had no current_language saved, fall back to first target
          if (resolvedLanguage === "en" && targets.length > 0) {
            resolvedLanguage = targets[0].language_code;
          }
        }

        setCurrentLanguageState(resolvedLanguage);
      } catch (err) {
        console.error("Failed to initialize language context", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []); // runs once on mount

  const setCurrentLanguage = (code: string) => {
    setCurrentLanguageState(code);
    // Persist to backend so it survives page reloads
    languagesApi
      .updatePreferences({ current_language: code })
      .catch((err) => console.error("Failed to persist current language", err));
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
    targetLanguages,
    setTargetLanguages,
    isInitialized,
  };

  // No full-screen spinner here — consumers that need to wait can check
  // isInitialized themselves. Public pages render immediately.
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
