export type PerfilUsuario = 'admin' | 'operacional' | 'financeiro' | 'vendas';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  name: string;
  profile: PerfilUsuario;
  is_active: boolean;
  created_at: string;
}

export interface UsuarioForm {
  username: string;
  email?: string;
  name: string;
  profile: PerfilUsuario;
  is_active: boolean;
  password?: string;
}
