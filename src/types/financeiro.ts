export type TipoLancamento = 'entrada' | 'saida';
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia';

export interface Lancamento {
  id: number;
  pedido?: number;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  forma_pagamento?: FormaPagamento;
  data_lancamento: string;
  observacoes?: string;
  created_at: string;
}

export interface FinanceiroSummary {
  entradas: number;
  saidas: number;
  saldo: number;
}
