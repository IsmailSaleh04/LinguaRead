import { apiCall, setToken, removeToken } from './client';
import type { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nativeLanguage: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiCall<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      await setToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      await setToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } finally {
      await removeToken();
    }
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiCall<User>('/api/user/profile');
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiCall<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
