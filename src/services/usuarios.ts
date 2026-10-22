import api from './api';
import { getAllPages } from './pagination';
import type { Usuario, UsuarioForm } from '../types/usuario';

export const usuariosService = {
  getAll: () => getAllPages<Usuario>('/api/v1/users/'),
  create: async (payload: UsuarioForm) => {
    const { data } = await api.post<Usuario>('/api/v1/users/', payload);
    return data;
  },
  update: async (id: number, payload: Partial<UsuarioForm>) => {
    const { data } = await api.patch<Usuario>(`/api/v1/users/${id}/`, payload);
    return data;
  },
  delete: async (id: number) => api.delete(`/api/v1/users/${id}/`),
};
