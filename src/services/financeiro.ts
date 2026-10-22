import api from './api';
import { getAllPages } from './pagination';
import type { Lancamento } from '../types/financeiro';

export interface FinanceiroFilters {
  data_inicio?: string;
  data_fim?: string;
}

export const financeiroService = {
  getAll: async (filters?: FinanceiroFilters) => {
    return getAllPages<Lancamento>('/api/v1/transactions/', { params: filters });
  },
  getSummary: async (filters?: FinanceiroFilters) => {
    const { data } = await api.get('/api/v1/transactions/resumo/', { params: filters });
    return data;
  },
  create: async (lancamento: Partial<Lancamento>) => {
    const { data } = await api.post('/api/v1/transactions/', lancamento);
    return data;
  },
  update: async (id: number, lancamento: Partial<Lancamento>) => {
    const { data } = await api.put(`/api/v1/transactions/${id}/`, lancamento);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/transactions/${id}/`);
    return data;
  }
};
