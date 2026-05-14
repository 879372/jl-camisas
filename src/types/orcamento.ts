export type CategoriaOpcao = 'quantidade' | 'prazo' | 'modelo' | 'estampa' | 'tecido' | 'adicional';

export interface OrcamentoOpcao {
  id: number;
  categoria: CategoriaOpcao;
  label: string;
  descricao?: string;
  valor_adicional: number;
  icone?: string;
  ordem: number;
  ativo: boolean;
}

export interface OrcamentoConfig {
  id: number;
  whatsapp_destino: string;
  mensagem_padrao?: string;
}
