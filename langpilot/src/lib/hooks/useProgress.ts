'use client';

import { useState, useEffect } from 'react';
import { progressApi } from '@/lib/api/progress';
import type { ProgressData, UserStats } from '@/lib/types';

interface UseProgressOptions {
  language?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  autoFetch?: boolean;
}

export function useProgress(options: UseProgressOptions = {}) {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await progressApi.getProgress(options.language, options.period);
      if (response.success && response.data) {
        setProgress(response.data.dailyProgress);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await progressApi.getStats(options.language);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchProgress();
      fetchStats();
    }
  }, [options.language, options.period]);

  return {
    progress,
    stats,
    isLoading,
    error,
    refetch: () => {
      fetchProgress();
      fetchStats();
    },
  };
}
