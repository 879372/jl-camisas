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
  ncm?: string;
  cest?: string;
  cfop?: string;
  origem: '0' | '1' | '2' | '3' | '5' | '8';
  cst_icms?: string;
  csosn?: string;
  aliquota_icms: number;
  aliquota_ipi: number;
  aliquota_pis: number;
  aliquota_cofins: number;
  created_at?: string;
  updated_at?: string;
}
