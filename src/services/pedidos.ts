import api from './api';
import type { Pedido } from '../types/pedido';

export const pedidosService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/pedidos/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/v1/pedidos/${id}/`);
    return data;
  },
  create: async (pedido: Partial<Pedido>) => {
    const { data } = await api.post('/api/v1/pedidos/', pedido);
    return data;
  },
  update: async (id: number, pedido: Partial<Pedido>) => {
    const { data } = await api.put(`/api/v1/pedidos/${id}/`, pedido);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/pedidos/${id}/`);
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await api.patch(`/api/v1/pedidos/${id}/`, { status });
    return data;
  }
};
