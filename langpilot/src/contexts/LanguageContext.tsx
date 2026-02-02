// src/contexts/LanguageContext.tsx
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
import { LoadingSpinner } from "@/components";

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (code: string) => void;
  targetLanguages: TargetLanguage[];
  setTargetLanguages: (langs: TargetLanguage[]) => void;
  // add loading state if you want to show spinner globally
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en"); // fallback only
  const [targetLanguages, setTargetLanguages] = useState<TargetLanguage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Option A: Load preferences (if it includes current_language)
        const prefsRes = await languagesApi.getPreferences();
        if (prefsRes.success && prefsRes.data) {
          const prefs = prefsRes.data as UserPreferences;
          setCurrentLanguage(prefs.current_language || "en");
          // If preferences also include targets, set them too
        }

        // Option B: Always load targets separately (recommended)
        const targetsRes = await languagesApi.getTargetLanguages();
        if (targetsRes.success && targetsRes.data) {
          const targets = targetsRes.data;
          setTargetLanguages(targets);

          // Auto-select first target if no current language set yet
          if (!currentLanguage || currentLanguage === "en") {
            const first = targets[0]?.language_code;
            if (first) setCurrentLanguage(first);
          }
        }
      } catch (err) {
        console.error("Failed to initialize language context", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []); // runs once on mount

  const value = {
    currentLanguage,
    setCurrentLanguage: (code: string) => {
      setCurrentLanguage(code);
      // Optional: persist to backend if needed
      // languagesApi.updatePreferences({ current_language: code });
    },
    targetLanguages,
    setTargetLanguages,
  };

  // Optional: show loading until languages are ready
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
