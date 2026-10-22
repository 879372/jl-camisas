import api from './api';
import type { Usuario } from '../types/usuario';

export const authService = {
  me: async (): Promise<Usuario> => {
    const { data } = await api.get<Usuario>('/api/v1/auth/me/');
    return data;
  },
};
