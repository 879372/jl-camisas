import api from './api';
import { getAllPages } from './pagination';
import type { Cliente } from '../types/cliente';

export const clientesService = {
  getAll: async () => {
    return getAllPages<Cliente>('/api/v1/customers/');
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/v1/customers/${id}/`);
    return data;
  },
  create: async (cliente: Partial<Cliente>) => {
    const { data } = await api.post('/api/v1/customers/', cliente);
    return data;
  },
  update: async (id: number, cliente: Partial<Cliente>) => {
    const { data } = await api.put(`/api/v1/customers/${id}/`, cliente);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/customers/${id}/`);
    return data;
  }
};
