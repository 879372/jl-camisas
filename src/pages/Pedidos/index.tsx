import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Calendar, Clock, User, ArrowRight, Maximize2, Hash } from 'lucide-react';
import { pedidosService } from '../../services/pedidos';
import type { Pedido } from '../../types/pedido';
import { PedidoModal } from './PedidoModal';
import { formatCurrency } from '../../utils/masks';

const COLUMNS = [
  { id: 'orcamento', title: 'Orçamento', color: 'slate', dot: 'bg-slate-300', border: 'border-slate-200' },
  { id: 'aguardando_pagamento', title: 'Aguardando Início', color: 'blue', dot: 'bg-blue-300', border: 'border-blue-200' },
  { id: 'em_producao', title: 'Em Produção', color: 'orange', dot: 'bg-orange-300', border: 'border-orange-200' },
  { id: 'concluido', title: 'Concluído', color: 'emerald', dot: 'bg-emerald-300', border: 'border-emerald-200' },
  { id: 'cancelado', title: 'Cancelado', color: 'rose', dot: 'bg-rose-300', border: 'border-rose-200' },
];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoToEdit, setPedidoToEdit] = useState<Pedido | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const data = await pedidosService.getAll();
      setPedidos(data.results || data);
    } catch (error) {
      console.error('Failed to fetch pedidos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await pedidosService.updateStatus(id, newStatus);
      loadPedidos();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleEdit = (pedido: Pedido) => {
    setPedidoToEdit(pedido);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setPedidoToEdit(null);
    setIsModalOpen(true);
  };

  const filteredPedidos = pedidos.filter(p => 
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Pedidos</h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhe e gerencie o fluxo de produção</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={openNewModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((column) => (
            <div key={column.id} className="w-80 flex flex-col h-full bg-slate-50/30 rounded-2xl border border-slate-200 overflow-hidden relative">
              {/* Top Border Indicator */}
              <div className={`h-1.5 w-full ${column.dot} border-b border-white/20`} />
              
              <div className="p-4 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.dot}`} />
                    <h3 className="font-bold text-slate-700 text-sm">{column.title}</h3>
                    <span className="bg-blue-50 text-blue-600 text-[11px] font-bold py-0.5 px-2 rounded-full border border-blue-100">
                      {filteredPedidos.filter(p => p.status === column.id).length}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 mt-1">
                    {formatCurrency(filteredPedidos.filter(p => p.status === column.id).reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="text-slate-300 hover:text-slate-500 p-1 rounded-full hover:bg-slate-50 transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="text-slate-300 hover:text-slate-500 p-1 rounded-full hover:bg-slate-50 transition-colors">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[100px]">
                {loading ? (
                  <div className="text-center py-10 text-slate-400 text-xs italic font-medium">Sincronizando...</div>
                ) : filteredPedidos.filter(p => p.status === column.id).length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium px-8 text-center leading-relaxed">
                    Nenhum pedido encontrado nesta etapa.
                  </div>
                ) : filteredPedidos.filter(p => p.status === column.id).map((pedido) => (
                  <div 
                    key={pedido.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative"
                    onClick={() => handleEdit(pedido)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-0.5">
                        <div className="text-[13px] font-bold text-slate-900 leading-none">#{pedido.numero}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(pedido.created_at || '').toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        {formatCurrency(pedido.valor_total)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cliente</div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold truncate">{pedido.cliente_nome || 'Cliente desconhecido'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entrega</div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                              {pedido.data_entrega_prevista ? new Date(pedido.data_entrega_prevista).toLocaleDateString('pt-BR') : '--/--/--'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Peças</div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Hash className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-black">
                              {pedido.itens?.reduce((acc: number, i: any) => acc + Number(i.quantidade), 0) || 0} unid.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        column.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                        column.color === 'orange' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        column.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        column.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {column.title}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentIndex = COLUMNS.findIndex(c => c.id === column.id);
                          const nextColumn = COLUMNS[currentIndex + 1]?.id;
                          if (nextColumn) handleUpdateStatus(pedido.id, nextColumn);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Mover para próxima etapa"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PedidoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadPedidos}
        pedidoToEdit={pedidoToEdit}
      />
    </div>
  );
}
