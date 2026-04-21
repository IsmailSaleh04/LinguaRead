'use client';

import { useState, useEffect, useRef } from 'react';
import { progressApi } from '@/lib/api/progress';
import type { ReadingSession } from '@/lib/types';

export function useReadingSession(articleId: number) {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await progressApi.startSession(articleId);
      if (response.success && response.data) {
        setSession(response.data);
        
        // Start timer
        intervalRef.current = setInterval(() => {
          setTimeSpent(prev => prev + 1);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (progressPercentage: number) => {
    if (!session) return;

    try {
      await progressApi.updateProgress(session.id, {
        progressPercentage,
        timeSpentSeconds: timeSpent,
      });
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  };

  const completeSession = async () => {
    if (!session) return;

    try {
      await progressApi.completeSession(session.id, {
        wordsLearned,
        totalTimeSeconds: timeSpent,
      });

      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete session');
    }
  };

  const markWordLearned = () => {
    setWordsLearned(prev => prev + 1);
  };

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    session,
    isLoading,
    error,
    timeSpent,
    wordsLearned,
    startSession,
    updateProgress,
    completeSession,
    markWordLearned,
  };
}
