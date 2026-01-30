import { apiCall } from "./client";
import type { Article, ApiResponse } from "../types";

export interface ArticleFilters {
  language?: string;
  difficulty?: string;
  topics?: string;
  limit?: number;
  offset?: number;
}

export const articlesApi = {
  async getArticles(
    filters: ArticleFilters = {},
  ): Promise<ApiResponse<Article[]>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    return apiCall<Article[]>(`/api/articles?${params.toString()}`);
  },

  async getArticle(id: number): Promise<ApiResponse<Article>> {
    return apiCall<Article>(`/api/articles/${id}`);
  },

  async getRecommended(
    language: string,
    limit = 10,
  ): Promise<ApiResponse<Article[]>> {
    return apiCall<Article[]>(
      `/api/articles/recommended?language=${language}&limit=${limit}`,
    );
  },

  async analyzeArticle(data: {
    url?: string;
    text?: string;
    language: string;
  }) {
    return apiCall("/api/articles/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getArticleWords(articleId: number): Promise<ApiResponse<any[]>> {
    return apiCall(`/api/articles/${articleId}/words`);
  },

  async getUnknownWords(articleId: number): Promise<ApiResponse<any[]>> {
    return apiCall(`/api/articles/${articleId}/unknown-words`);
  },

  async searchWikipedia(query: string, language: string) {
    return apiCall("/api/articles/search-wikipedia", {
      method: "POST",
      body: JSON.stringify({ searchQuery: query, language }),
    });
  },

  async fetchWikipediaArticle(title: string, language: string) {
    return apiCall("/api/articles/fetch-wikipedia", {
      method: "POST",
      body: JSON.stringify({ title, language }),
    });
  },

  async preloadRecommendations(language: string): Promise<ApiResponse<any[]>> {
    return apiCall("/api/articles/preload-recommendations", {
      method: "POST",
      body: JSON.stringify({ language }),
    });
  },
};
