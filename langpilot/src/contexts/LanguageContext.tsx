'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TargetLanguage } from '@/lib/types';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (code: string) => void;
  targetLanguages: TargetLanguage[];
  setTargetLanguages: (languages: TargetLanguage[]) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [targetLanguages, setTargetLanguages] = useState<TargetLanguage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentLanguage');
    if (saved) {
      setCurrentLanguageState(saved);
    }
  }, []);

  const setCurrentLanguage = (code: string) => {
    setCurrentLanguageState(code);
    localStorage.setItem('currentLanguage', code);
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
    targetLanguages,
    setTargetLanguages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
