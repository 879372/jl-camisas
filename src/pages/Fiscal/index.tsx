import { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/masks';

interface NotaFiscal {
  id: number;
  pedido: number;
  tipo: string;
  numero: string;
  serie: string;
  chave_acesso: string;
  status: string;
  emitida_em: string;
  created_at: string;
}

export default function Fiscal() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadNotas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/notas-fiscais/');
      setNotas(data.results || data);
    } catch (error) {
      console.error('Failed to fetch notas fiscais', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotas();
  }, []);

  const filteredNotas = notas.filter(n => 
    n.numero?.includes(searchTerm) || n.chave_acesso?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Módulo Fiscal</h1>
          <p className="text-slate-500 text-sm mt-1">Gerenciamento de Notas Fiscais Eletrônicas</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center gap-2 text-sm"
          >
            <Download className="w-5 h-5" />
            Exportar XMLs
          </button>
        </div>
      </div>

      {/* Summary Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Autorizadas', count: notas.filter(n => n.status === 'autorizada').length, icon: CheckCircle2, color: 'emerald' },
          { label: 'Pendentes', count: notas.filter(n => n.status === 'pendente').length, icon: Clock, color: 'blue' },
          { label: 'Rejeitadas', count: notas.filter(n => n.status === 'rejeitada').length, icon: AlertCircle, color: 'rose' },
          { label: 'Canceladas', count: notas.filter(n => n.status === 'cancelada').length, icon: AlertCircle, color: 'slate' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por número ou chave..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Número / Série</th>
                <th className="px-6 py-4">Chave de Acesso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Carregando notas fiscais...
                  </td>
                </tr>
              ) : filteredNotas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhuma nota fiscal emitida.
                  </td>
                </tr>
              ) : (
                filteredNotas.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {n.emitida_em ? new Date(n.emitida_em).toLocaleDateString('pt-BR') : '--/--/--'}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                         n.tipo === 'nfe' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                       }`}>
                         {n.tipo}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {n.numero || '---'} <span className="text-slate-400 font-normal">/ {n.serie || '0'}</span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-slate-400 font-mono">
                      {n.chave_acesso || 'NÃO GERADA'}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                         {n.status === 'autorizada' ? (
                           <>
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-emerald-600 font-bold text-[10px] uppercase">Autorizada</span>
                           </>
                         ) : n.status === 'pendente' ? (
                           <>
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                             <span className="text-blue-600 font-bold text-[10px] uppercase">Pendente</span>
                           </>
                         ) : (
                           <>
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                             <span className="text-rose-600 font-bold text-[10px] uppercase">{n.status}</span>
                           </>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Imprimir DANFE">
                           <Printer className="w-4 h-4" />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Ver no SEFAZ">
                           <ExternalLink className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
