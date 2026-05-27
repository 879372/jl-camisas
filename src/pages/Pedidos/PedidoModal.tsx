import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { X, Plus, Trash2, Upload, File as FileIcon } from 'lucide-react';
import type { Pedido, PedidoArquivo } from '../../types/pedido';
import type { Cliente } from '../../types/cliente';
import { pedidosService } from '../../services/pedidos';
import { clientesService } from '../../services/clientes';
import { formatCurrency } from '../../utils/masks';

interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pedidoToEdit: Pedido | null;
}

export function PedidoModal({ isOpen, onClose, onSave, pedidoToEdit }: PedidoModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
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
          const [clientesData] = await Promise.all([
            clientesService.getAll()
          ]);
          setClientes(clientesData.results || clientesData);
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
      setIsUploading(true);
      const payload = {
        ...data,
        data_entrega_prevista: data.data_entrega_prevista || undefined
      };

      let savedPedido: Pedido;
      if (pedidoToEdit) {
        const response = await pedidosService.update(pedidoToEdit.id, payload);
        savedPedido = response;
      } else {
        const response = await pedidosService.create(payload);
        savedPedido = response;
      }

      // Upload files
      if (filesToUpload.length > 0) {
        await Promise.all(
          filesToUpload.map(file => pedidosService.uploadFile(savedPedido.id, file))
        );
      }

      setFilesToUpload([]);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save pedido', error);
      alert('Erro ao salvar pedido.');
    } finally {
      setIsUploading(false);
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

            <div className="col-span-3 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Arquivos e Artes</h3>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  Selecionar Arquivos
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFilesToUpload([...filesToUpload, ...Array.from(e.target.files)]);
                      }
                    }}
                  />
                </label>
              </div>

              {filesToUpload.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {filesToUpload.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFilesToUpload(filesToUpload.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pedidoToEdit?.arquivos && pedidoToEdit.arquivos.length > 0 && (
                <div className="mt-4 space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arquivos Existentes</p>
                   <div className="grid grid-cols-2 gap-3">
                     {pedidoToEdit.arquivos.map((arquivo: PedidoArquivo) => (
                       <a 
                         key={arquivo.id} 
                         href={arquivo.caminho} 
                         target="_blank" 
                         rel="noreferrer"
                         className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-all group"
                       >
                         <FileIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                         <span className="text-xs font-medium text-slate-600 truncate">{arquivo.nome_original}</span>
                       </a>
                     ))}
                   </div>
                </div>
              )}
            </div>

            <div className="col-span-3 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações Internas</label>
              <textarea
                {...register('observacoes_internas')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Notas que apenas a equipe verá..."
              />
            </div>

            <div className="col-span-3 sm:col-span-1 bg-blue-50 p-6 rounded-2xl flex flex-col justify-center items-end">
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Total do Pedido</span>
              <span className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(watch('valor_total') || 0)}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Salvando...' : (pedidoToEdit ? 'Atualizar Pedido' : 'Criar Pedido')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
