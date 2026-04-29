import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Calendar,
  User,
  AlertCircle,
  Hash
} from 'lucide-react';
import { pedidosService } from '../../services/pedidos';
import { formatCurrency } from '../../utils/masks';
import type { Pedido } from '../../types/pedido';

export default function Dashboard() {
  const [stats, setStats] = useState({
    orcamento: { count: 0, total: 0 },
    aguardando: { count: 0, total: 0 },
    producao: { count: 0, total: 0 },
    concluido: { count: 0, total: 0 },
    totalItens: 0
  });
  const [proximasEntregas, setProximasEntregas] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await pedidosService.getAll();
      const pedidosList: Pedido[] = data.results || data;
      
      const newStats = {
        orcamento: { count: 0, total: 0 },
        aguardando: { count: 0, total: 0 },
        producao: { count: 0, total: 0 },
        concluido: { count: 0, total: 0 },
        totalItens: 0
      };

      pedidosList.forEach(p => {
        const val = Number(p.valor_total) || 0;
        const itemsQty = p.itens?.reduce((acc: number, item: any) => acc + Number(item.quantidade), 0) || 0;
        newStats.totalItens += itemsQty;

        if (p.status === 'orcamento') {
          newStats.orcamento.count++;
          newStats.orcamento.total += val;
        } else if (p.status === 'aguardando_pagamento') {
          newStats.aguardando.count++;
          newStats.aguardando.total += val;
        } else if (p.status === 'em_producao') {
          newStats.producao.count++;
          newStats.producao.total += val;
        } else if (p.status === 'concluido') {
          newStats.concluido.count++;
          newStats.concluido.total += val;
        }
      });

      const upcoming = pedidosList
        .filter(p => p.status !== 'concluido' && p.status !== 'cancelado' && p.data_entrega_prevista)
        .sort((a, b) => new Date(a.data_entrega_prevista!).getTime() - new Date(b.data_entrega_prevista!).getTime())
        .slice(0, 5);

      setStats(newStats);
      setProximasEntregas(upcoming);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <p className="text-slate-400 font-medium italic text-xs uppercase tracking-widest">Sincronizando Operação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Gestão Operacional</h1>
          <p className="text-slate-500 text-sm mt-1">Visão consolidada de pedidos e produção</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-4">
             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Total de Peças</span>
             <span className="text-xl font-bold text-blue-600">{stats.totalItens}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      
      {/* Operational Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Orçamentos', val: stats.orcamento.total, count: stats.orcamento.count, icon: ClipboardList, color: 'slate', border: 'border-b-slate-200' },
          { label: 'Aguardando Início', val: stats.aguardando.total, count: stats.aguardando.count, icon: Clock, color: 'blue', border: 'border-b-blue-200' },
          { label: 'Em Produção', val: stats.producao.total, count: stats.producao.count, icon: PlayCircle, color: 'orange', border: 'border-b-orange-200' },
          { label: 'Concluídos', val: stats.concluido.total, count: stats.concluido.count, icon: CheckCircle2, color: 'emerald', border: 'border-b-emerald-200' },
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-b-4 ${card.border}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-500 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Pedidos</span>
                <span className={`text-sm font-bold text-${card.color}-600`}>{card.count}</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(card.val)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Deliveries */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Próximas Entregas</h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1 italic">Cronograma de finalização</p>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          
          <div className="flex-1">
            {proximasEntregas.length === 0 ? (
              <div className="p-12 text-center text-slate-300 font-medium uppercase tracking-widest text-xs italic">
                Nenhum pedido pendente de entrega
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {proximasEntregas.map((pedido) => (
                  <div key={pedido.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                        #{pedido.numero.split('-')[1]?.slice(-2) || '00'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Pedido #{pedido.numero}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <User className="w-3 h-3 text-slate-300" />
                          <p className="text-[10px] font-medium text-slate-400 uppercase truncate max-w-[120px]">{pedido.cliente_nome}</p>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <Hash className="w-3 h-3 text-slate-300" />
                          <p className="text-[10px] font-bold text-blue-500 uppercase">
                            {pedido.itens?.reduce((acc: number, i: any) => acc + Number(i.quantidade), 0) || 0} PEÇAS
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700">{formatCurrency(pedido.valor_total)}</p>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          <p className="text-[10px] font-bold text-orange-500 uppercase">
                            {new Date(pedido.data_entrega_prevista!).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border shadow-sm ${
                        pedido.status === 'em_producao' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {pedido.status === 'aguardando_pagamento' ? 'Aguardando Início' : pedido.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operational Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter mb-2 italic">Atenção Crítica</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Existem <span className="text-orange-400 font-bold">{proximasEntregas.length}</span> pedidos programados para os próximos dias. Verifique a fila de produção.
              </p>
              <div className="mt-8 space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">
                    <span>Total de Itens Pendentes</span>
                    <span className="text-white font-bold">{stats.totalItens} unidades</span>
                 </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-[5rem] -mr-8 -mt-8 blur-xl" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
               <Hash className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Volume Total</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalItens}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">Peças no sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}
