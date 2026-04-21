import { apiCall } from './client';
import type { UserWord, Word, ApiResponse } from '../types';

export const vocabularyApi = {
  async getUserWords(params: {
    language?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<UserWord[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });

    return apiCall<UserWord[]>(`/api/user/words?${searchParams.toString()}`);
  },

  async getWordStats(language?: string): Promise<ApiResponse<any>> {
    const url = language ? `/api/user/words/stats?language=${language}` : '/api/user/words/stats';
    return apiCall(url);
  },

  // NEW: Updated to support action tracking (translate, mark, expose)
  async updateWordStatus(
    wordId: number, 
    status?: 'unknown' | 'learning' | 'known',
    action?: 'translate' | 'mark' | 'expose'
  ): Promise<ApiResponse<any>> {
    return apiCall(`/api/user/words/${wordId}/update`, {
      method: 'POST',
      body: JSON.stringify({ status, action }),
    });
  },

  async searchWords(text: string, language: string): Promise<ApiResponse<Word[]>> {
    return apiCall<Word[]>(`/api/words/search?text=${encodeURIComponent(text)}&language=${language}`);
  },

  async getWord(id: number): Promise<ApiResponse<Word>> {
    return apiCall<Word>(`/api/words/${id}`);
  },

  async saveTranslation(wordId: number, translation: string, context?: string): Promise<ApiResponse<any>> {
    return apiCall('/api/user/translations', {
      method: 'POST',
      body: JSON.stringify({ wordId, translation, context }),
    });
  },

  async getTranslation(wordId: number): Promise<ApiResponse<any>> {
    return apiCall(`/api/user/translations/${wordId}`);
  },

  async deleteTranslation(wordId: number): Promise<ApiResponse<any>> {
    return apiCall(`/api/user/translations/${wordId}`, {
      method: 'DELETE',
    });
  },

  // NEW: Bulk lookup for article words
  async bulkLookup(words: string[], language: string): Promise<ApiResponse<Word[]>> {
    return apiCall('/api/words/bulk-lookup', {
      method: 'POST',
      body: JSON.stringify({ words, language }),
    });
  },
};
