import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Settings, MessageSquare, 
  DollarSign, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  getOrcamentoConfig, 
  updateOrcamentoConfig, 
  getOrcamentoOpcoes, 
  deleteOrcamentoOpcao 
} from '../../services/orcamento';
import { formatCurrency, parseCurrency } from '../../utils/masks';
import OpcaoOrcamentoModal from './OpcaoOrcamentoModal';

export default function OrcamentoConfigPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opcaoToEdit, setOpcaoToEdit] = useState<any | null>(null);
  
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['orcamento-config'],
    queryFn: async () => {
      const data = await getOrcamentoConfig();
      return data.results?.[0] || null;
    }
  });

  const { data: opcoes, isLoading: loadingOpcoes } = useQuery({
    queryKey: ['orcamento-opcoes'],
    queryFn: async () => {
      const data = await getOrcamentoOpcoes();
      return data.results || [];
    }
  });

  const configMutation = useMutation({
    mutationFn: (data: any) => updateOrcamentoConfig(config.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamento-config'] });
      alert('Configuração atualizada!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrcamentoOpcao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamento-opcoes'] });
    }
  });

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      valor_base: parseCurrency(formData.get('valor_base') as string),
      mensagem_template: formData.get('mensagem_template'),
    };
    configMutation.mutate(data);
  };

  const openEditModal = (opcao: any) => {
    setOpcaoToEdit(opcao);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setOpcaoToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta opção?')) {
      deleteMutation.mutate(id);
    }
  };

  if (loadingConfig || loadingOpcoes) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configuração do Orçamento Público</h1>
          <p className="text-slate-500">Gerencie as opções e valores que aparecem para seus clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurações Gerais */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
              <Settings className="w-5 h-5 text-blue-500" />
              Configurações Gerais
            </div>
            
            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Base (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="valor_base"
                    defaultValue={formatCurrency(config?.valor_base || 0)}
                    onChange={(e) => e.target.value = formatCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template da Mensagem</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="mensagem_template"
                    defaultValue={config?.mensagem_template}
                    rows={4}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Use {'{nome}'} como placeholder.</p>
              </div>

              <button
                type="submit"
                disabled={configMutation.isPending}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Salvar Configuração
              </button>
            </form>
          </div>
        </div>

        {/* Opções por Categoria */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Opções de Personalização
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> Adicionar Opção
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4">Vl. Adicional</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opcoes?.map((opcao: any) => (
                    <tr key={opcao.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase">
                          {opcao.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {opcao.icone} {opcao.label}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">
                        {opcao.valor_adicional > 0 ? `+ ${formatCurrency(opcao.valor_adicional)}` : '---'}
                      </td>
                      <td className="px-6 py-4">
                        {opcao.ativo ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle className="w-3 h-3" /> Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                            <XCircle className="w-3 h-3" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(opcao)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(opcao.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <OpcaoOrcamentoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOpcaoToEdit(null);
        }}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['orcamento-opcoes'] })}
        opcaoToEdit={opcaoToEdit}
      />
    </div>
  );
}
