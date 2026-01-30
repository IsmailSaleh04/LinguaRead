'use client';

import { useState, useEffect } from 'react';
import { articlesApi } from '@/lib/api/articles';
import type { Article } from '@/lib/types';

interface UseArticlesOptions {
  language?: string;
  difficulty?: string;
  topics?: string;
  autoFetch?: boolean;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });

  const fetchArticles = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await articlesApi.getArticles({
        ...options,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      });

      if (response.success && response.data) {
        setArticles(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchArticles();
    }
  }, [options.language, options.difficulty, options.topics]);

  return {
    articles,
    isLoading,
    error,
    pagination,
    refetch: fetchArticles,
  };
}
