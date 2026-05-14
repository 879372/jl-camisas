import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

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
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Só redireciona se não estiver na página de login ou orçamento público
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/orcamento')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
