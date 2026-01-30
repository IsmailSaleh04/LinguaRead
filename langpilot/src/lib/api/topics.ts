import { apiCall } from './client';
import type { Topic, Article, ApiResponse } from '../types';

export const topicsApi = {
  async getTopics(): Promise<ApiResponse<Topic[]>> {
    return apiCall<Topic[]>('/api/topics');
  },

  async getTopicArticles(topicId: number, language: string, limit = 20, offset = 0): Promise<ApiResponse<Article[]>> {
    return apiCall<Article[]>(`/api/topics/${topicId}/articles?language=${language}&limit=${limit}&offset=${offset}`);
  },
};
