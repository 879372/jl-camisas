import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Pedido, PedidoItem } from '../../types/pedido';
import type { Cliente } from '../../types/cliente';
import type { Produto } from '../../types/produto';
import { pedidosService } from '../../services/pedidos';
import { clientesService } from '../../services/clientes';
import { produtosService } from '../../services/produtos';
import { formatCurrency, parseCurrency } from '../../utils/masks';

interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pedidoToEdit: Pedido | null;
}

export function PedidoModal({ isOpen, onClose, onSave, pedidoToEdit }: PedidoModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  const { register, control, handleSubmit, reset, setValue, watch } = useForm<Partial<Pedido>>({
    defaultValues: {
      status: 'orcamento',
      status_pagamento: 'pendente',
      itens: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens"
  });

  const watchedItens = useWatch({
    control,
    name: 'itens'
  });

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [clientesData, produtosData] = await Promise.all([
            clientesService.getAll(),
            produtosService.getAll()
          ]);
          setClientes(clientesData.results || clientesData);
          setProdutos(produtosData.results || produtosData);
        } catch (error) {
          console.error("Failed to load initial data for PedidoModal", error);
        }
      };
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (pedidoToEdit) {
      reset(pedidoToEdit);
    } else {
      reset({
        status: 'orcamento',
        status_pagamento: 'pendente',
        itens: [],
        numero: `PED-${Date.now().toString().slice(-6)}`
      });
    }
  }, [pedidoToEdit, reset, isOpen]);

  // Calculate total whenever items change
  useEffect(() => {
    if (watchedItens) {
      const grandTotal = watchedItens.reduce((acc, item) => {
        return acc + (Number(item?.quantidade) || 0) * (Number(item?.valor_unitario) || 0);
      }, 0);
      setValue('valor_total', grandTotal);
    }
  }, [watchedItens, setValue]);

  const onSubmit = async (data: Partial<Pedido>) => {
    try {
      const payload = {
        ...data,
        data_entrega_prevista: data.data_entrega_prevista || null
      };

      if (pedidoToEdit) {
        await pedidosService.update(pedidoToEdit.id, payload);
      } else {
        await pedidosService.create(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save pedido', error);
      alert('Erro ao salvar pedido.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {pedidoToEdit ? `Editar Pedido ${pedidoToEdit.numero}` : 'Novo Pedido'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
          <input type="hidden" {...register('valor_total')} />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
              <select
                {...register('cliente', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="orcamento">Orçamento</option>
                <option value="aguardando_pagamento">Aguardando Início</option>
                <option value="em_producao">Em Produção</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrega Prevista</label>
              <input
                type="date"
                {...register('data_entrega_prevista')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Itens do Pedido</h3>
                <button
                  type="button"
                  onClick={() => append({ descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 })}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl items-end">
                    <div className="col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição / Produto</label>
                      <input
                        {...register(`itens.${index}.descricao` as const, { required: true })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="Ex: Camiseta P"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qtd</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.quantidade` as const, { required: true })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">V. Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.valor_unitario` as const, { required: true })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total</label>
                      <input type="hidden" {...register(`itens.${index}.valor_total` as const)} />
                      <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                        {formatCurrency((watchedItens?.[index]?.quantidade || 0) * (watchedItens?.[index]?.valor_unitario || 0))}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-3 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                {...register('observacoes')}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              ></textarea>
            </div>

            <div className="col-span-3 sm:col-span-1 bg-blue-50 p-6 rounded-2xl flex flex-col justify-center items-end">
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total do Pedido</span>
              <span className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(watch('valor_total') || 0)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
