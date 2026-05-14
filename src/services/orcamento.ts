import api from './api';

export const getOrcamentoConfig = async () => {
  const response = await api.get('/api/v1/orcamento-publico/config/');
  return response.data;
};

export const updateOrcamentoConfig = async (id: number, data: any) => {
  const response = await api.patch(`/api/v1/orcamento-publico/config/${id}/`, data);
  return response.data;
};

export const getOrcamentoOpcoes = async (params?: any) => {
  const response = await api.get('/api/v1/orcamento-publico/opcoes/', { params });
  return response.data;
};

export const createOrcamentoOpcao = async (data: any) => {
  const response = await api.post('/api/v1/orcamento-publico/opcoes/', data);
  return response.data;
};

export const updateOrcamentoOpcao = async (id: number, data: any) => {
  const response = await api.patch(`/api/v1/orcamento-publico/opcoes/${id}/`, data);
  return response.data;
};

export const deleteOrcamentoOpcao = async (id: number) => {
  const response = await api.delete(`/api/v1/orcamento-publico/opcoes/${id}/`);
  return response.data;
};

export const criarPedidoPublico = async (data: any) => {
  const response = await api.post('/api/v1/orcamento-publico/criar-pedido/', data);
  return response.data;
};
