import api from './api';
import type { Produto } from '../types/produto';

export const produtosService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/produtos/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/v1/produtos/${id}/`);
    return data;
  },
  create: async (produto: Partial<Produto>) => {
    const { data } = await api.post('/api/v1/produtos/', produto);
    return data;
  },
  update: async (id: number, produto: Partial<Produto>) => {
    const { data } = await api.put(`/api/v1/produtos/${id}/`, produto);
    return data;
  },
  delete: async (id: number) => {
    // In a real app we might do soft delete (active=false)
    // but here the viewset supports DELETE
    const { data } = await api.delete(`/api/v1/produtos/${id}/`);
    return data;
  }
};
