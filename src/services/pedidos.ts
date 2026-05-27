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
  },
  uploadFile: async (pedidoId: number, file: File) => {
    const formData = new FormData();
    formData.append('pedido', pedidoId.toString());
    formData.append('caminho', file);
    formData.append('nome_original', file.name);
    formData.append('mime_type', file.type);
    formData.append('tamanho_bytes', file.size.toString());
    
    const { data } = await api.post('/api/v1/pedidos-arquivos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};
