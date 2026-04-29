export interface Cliente {
  id: number;
  nome: string;
  tipo: 'fisica' | 'juridica';
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  data_nascimento?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}
