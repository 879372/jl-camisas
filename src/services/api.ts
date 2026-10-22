import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: apiBaseURL,
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshPromise: Promise<string> | null = null;

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Interceptador para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para tratar erros globais (Ex: Token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const refreshToken = localStorage.getItem('refresh_token');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh/');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      refreshToken
    ) {
      originalRequest._retry = true;
      refreshPromise ??= axios
        .post(`${apiBaseURL}/api/v1/auth/refresh/`, { refresh: refreshToken })
        .then((response) => {
          localStorage.setItem('access_token', response.data.access);
          if (response.data.refresh) {
            localStorage.setItem('refresh_token', response.data.refresh);
          }
          return response.data.access as string;
        })
        .finally(() => {
          refreshPromise = null;
        });

      try {
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearSession();
      }
    } else if (error.response?.status === 401) {
      clearSession();
    }

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/orcamento')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
