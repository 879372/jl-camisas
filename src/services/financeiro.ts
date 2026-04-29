import api from './api';
import type { Lancamento } from '../types/financeiro';

export const financeiroService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/lancamentos/');
    return data;
  },
  getSummary: async () => {
    // We can implement a custom endpoint or calculate from the list
    const { data } = await api.get('/api/v1/lancamentos/');
    const list = data.results || data;
    
    const entradas = list
      .filter((l: Lancamento) => l.tipo === 'entrada')
      .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0);
      
    const saidas = list
      .filter((l: Lancamento) => l.tipo === 'saida')
      .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0);
      
    return {
      entradas,
      saidas,
      saldo: entradas - saidas
    };
  },
  create: async (lancamento: Partial<Lancamento>) => {
    const { data } = await api.post('/api/v1/lancamentos/', lancamento);
    return data;
  },
  update: async (id: number, lancamento: Partial<Lancamento>) => {
    const { data } = await api.put(`/api/v1/lancamentos/${id}/`, lancamento);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/v1/lancamentos/${id}/`);
    return data;
  }
};
