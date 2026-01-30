import { apiCall } from './client';
import type { ProgressData, UserStats, ReadingSession, ApiResponse } from '../types';

export const progressApi = {
  async getProgress(language?: string, period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<{
    dailyProgress: ProgressData[];
    totals: any;
    period: string;
  }>> {
    const params = new URLSearchParams({ period });
    if (language) params.append('language', language);
    
    return apiCall(`/api/user/progress?${params.toString()}`);
  },

  async getStats(language?: string): Promise<ApiResponse<UserStats>> {
    const url = language ? `/api/user/stats?language=${language}` : '/api/user/stats';
    return apiCall<UserStats>(url);
  },

  async startSession(articleId: number): Promise<ApiResponse<ReadingSession>> {
    return apiCall<ReadingSession>('/api/reading-sessions', {
      method: 'POST',
      body: JSON.stringify({ articleId }),
    });
  },

  async updateProgress(sessionId: number, data: {
    progressPercentage: number;
    timeSpentSeconds: number;
  }): Promise<ApiResponse<ReadingSession>> {
    return apiCall<ReadingSession>(`/api/reading-sessions/${sessionId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async completeSession(sessionId: number, data: {
    wordsLearned: number;
    totalTimeSeconds: number;
  }): Promise<ApiResponse<ReadingSession>> {
    return apiCall<ReadingSession>(`/api/reading-sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getHistory(limit = 20, offset = 0): Promise<ApiResponse<any[]>> {
    return apiCall(`/api/reading-sessions/history?limit=${limit}&offset=${offset}`);
  },
};
