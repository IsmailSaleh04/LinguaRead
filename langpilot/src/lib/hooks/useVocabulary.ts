'use client';

import { useState, useEffect } from 'react';
import { vocabularyApi } from '@/lib/api/vocabulary';
import type { UserWord } from '@/lib/types';

interface UseVocabularyOptions {
  language?: string;
  status?: 'unknown' | 'learning' | 'known';
  autoFetch?: boolean;
}

export function useVocabulary(options: UseVocabularyOptions = {}) {
  const [words, setWords] = useState<UserWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchWords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vocabularyApi.getUserWords(options);
      if (response.success && response.data) {
        setWords(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vocabulary');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await vocabularyApi.getWordStats(options.language);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const updateWordStatus = async (wordId: number, status: 'unknown' | 'learning' | 'known') => {
    try {
      await vocabularyApi.updateWordStatus(wordId, status);
      await fetchWords();
      await fetchStats();
    } catch (err: any) {
      setError(err.message || 'Failed to update word status');
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchWords();
      fetchStats();
    }
  }, [options.language, options.status]);

  return {
    words,
    stats,
    isLoading,
    error,
    updateWordStatus,
    refetch: fetchWords,
  };
}
