import api from './api';
import { getAllPages } from './pagination';
import type { Pedido } from '../types/pedido';

export interface DashboardData {
  por_status: Record<string, { quantidade: number; total: string | number }>;
  faturamento_mes: string | number;
  pedidos_mes: number;
  total_itens_pendentes: string | number;
  proximas_entregas: Pedido[];
  grafico_pedidos: Array<{ mes: string; quantidade: number }>;
  pedidos_criticos: number;
}

export const pedidosService = {
  getAll: async () => {
    return getAllPages<Pedido>('/api/v1/orders/');
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/v1/orders/${id}/`);
    return data;
  },
  getDashboard: async () => {
    const { data } = await api.get<DashboardData>('/api/v1/orders/dashboard/');
    return data;
  },
  create: async (pedido: Partial<Pedido>) => {
    const { data } = await api.post('/api/v1/orders/', pedido);
    return data;
  },
  update: async (id: number, pedido: Partial<Pedido>) => {
    const { data } = await api.put(`/api/v1/orders/${id}/`, pedido);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/orders/${id}/`);
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await api.patch(`/api/v1/orders/${id}/`, { status });
    return data;
  },
  conclude: async (id: number, tipo: 'nfe' | 'nfce' | 'none') => {
    const { data } = await api.post(`/api/v1/orders/${id}/concluir/`, {
      nota_fiscal: tipo,
    });
    return data;
  },
  uploadFile: async (pedidoId: number, file: File) => {
    const formData = new FormData();
    formData.append('pedido', pedidoId.toString());
    formData.append('caminho', file);
    formData.append('nome_original', file.name);
    formData.append('mime_type', file.type);
    formData.append('tamanho_bytes', file.size.toString());
    
    const { data } = await api.post('/api/v1/files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};
