import axios, { isAxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        sessionStorage.getItem('sukuu_token') ||
        localStorage.getItem('school_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isAuthMeRequest = error.config?.url?.includes('/auth/me');

    if (isAxiosError(error) && process.env.NODE_ENV === 'development') {
      const status = error.response?.status ?? 'network';
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;
      console.warn(`[API] ✗ ${status} ${error.config?.url} — ${message}`);
    }

    if (error.response?.status === 401 && !isLoginRequest && !isAuthMeRequest) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sukuu_token');
        localStorage.removeItem('school_token');
        localStorage.removeItem('school_user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    return Promise.reject(error);
  }
);
