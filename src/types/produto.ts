export interface ProdutoVariacao {
  id?: number;
  produto?: number;
  nome: string;
  valor_adicional: number;
  ativo: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco_base: number;
  unidade: string;
  ativo: boolean;
  variacoes?: ProdutoVariacao[];
  created_at?: string;
  updated_at?: string;
}
