import { ApiResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function setToken(token: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
}

async function removeToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, try to refresh token
      if (response.status === 401 && endpoint !== '/api/auth/refresh') {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiCall(endpoint, options);
        }
      }
      
      throw new ApiError(data.error || 'Request failed', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error. Please check your connection.');
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await removeToken();
      return false;
    }

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      await setToken(data.data.accessToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export { getToken, setToken, removeToken, ApiError };
