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
  especificacoes?: any;
}

export interface Pedido {
  id: number;
  numero: string;
  cliente: number;
  cliente_nome?: string; // We can add this via serializer or fetch
  status: StatusPedido;
  status_pagamento: StatusPagamento;
  valor_total: number;
  valor_pago: number;
  data_entrega_prevista?: string;
  observacoes?: string;
  observacoes_internas?: string;
  itens?: PedidoItem[];
  created_at?: string;
  updated_at?: string;
}
