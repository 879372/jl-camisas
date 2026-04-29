import api from './api';
import type { Cliente } from '../types/cliente';

export const clientesService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/clientes/');
    // If pagination is used, data might be { results: [...], count: ... }
    // We handle that in the component or extract results here if needed.
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/v1/clientes/${id}/`);
    return data;
  },
  create: async (cliente: Partial<Cliente>) => {
    const { data } = await api.post('/api/v1/clientes/', cliente);
    return data;
  },
  update: async (id: number, cliente: Partial<Cliente>) => {
    const { data } = await api.put(`/api/v1/clientes/${id}/`, cliente);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/clientes/${id}/`);
    return data;
  }
};
