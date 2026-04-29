import { useEffect, useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { financeiroService } from '../../services/financeiro';
import type { Lancamento, FinanceiroSummary } from '../../types/financeiro';
import { LancamentoModal } from './LancamentoModal';
import { formatCurrency } from '../../utils/masks';

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [summary, setSummary] = useState<FinanceiroSummary>({ entradas: 0, saidas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lancamentoToEdit, setLancamentoToEdit] = useState<Lancamento | null>(null);
  const [fixedType, setFixedType] = useState<'entrada' | 'saida' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [listData, summaryData] = await Promise.all([
        financeiroService.getAll(),
        financeiroService.getSummary()
      ]);
      setLancamentos(listData.results || listData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch financeiro data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = (type: 'entrada' | 'saida') => {
    setLancamentoToEdit(null);
    setFixedType(type);
    setIsModalOpen(true);
  };

  const handleEdit = (lancamento: Lancamento) => {
    setLancamentoToEdit(lancamento);
    setFixedType(lancamento.tipo);
    setIsModalOpen(true);
  };

  const filteredLancamentos = lancamentos.filter(l => 
    l.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">Controle de entradas, saídas e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openNewModal('entrada')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            Nova Entrada
          </button>
          <button 
            onClick={() => openNewModal('saida')}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-100 flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entradas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.entradas)}</p>
            </div>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5 rotate-12" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saídas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.saidas)}</p>
            </div>
          </div>
          <TrendingDown className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-500/5 -rotate-12" />
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Atual</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(summary.saldo)}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por descrição..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar por data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Carregando movimentações...
                  </td>
                </tr>
              ) : filteredLancamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredLancamentos.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {new Date(l.data_lancamento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{l.descricao}</td>
                    <td className="px-6 py-4">
                      {l.tipo === 'entrada' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-[10px] uppercase border border-green-100">
                          <ArrowUpCircle className="w-3 h-3" />
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-[10px] uppercase border border-red-100">
                          <ArrowDownCircle className="w-3 h-3" />
                          Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px]">
                      {l.forma_pagamento || '---'}
                    </td>
                    <td className={`px-6 py-4 font-bold ${l.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {l.tipo === 'entrada' ? '+' : '-'} {formatCurrency(l.valor)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(l)}
                        className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LancamentoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadData}
        lancamentoToEdit={lancamentoToEdit}
        fixedType={fixedType}
      />
    </div>
  );
}
