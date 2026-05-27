export type StatusPedido = 'orcamento' | 'aguardando_pagamento' | 'em_producao' | 'concluido' | 'cancelado';
export type StatusPagamento = 'pendente' | 'parcial' | 'pago';

export interface PedidoItem {
  id?: number;
  pedido?: number;
  produto?: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  especificacoes?: Record<string, unknown>;
}

export interface PedidoArquivo {
  id: number;
  nome_original: string;
  caminho: string;
  mime_type?: string;
  tamanho_bytes?: number;
  uploaded_at: string;
}

export interface Pedido {
  id: number;
  numero: string;
  cliente: number;
  cliente_nome?: string;
  status: StatusPedido;
  status_pagamento: StatusPagamento;
  valor_total: number;
  valor_pago: number;
  data_entrega_prevista?: string;
  observacoes?: string;
  observacoes_internas?: string;
  itens?: PedidoItem[];
  arquivos?: PedidoArquivo[];
  created_at?: string;
  updated_at?: string;
}
