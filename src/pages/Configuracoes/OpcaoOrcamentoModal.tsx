import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createOrcamentoOpcao, updateOrcamentoOpcao } from '../../services/orcamento';
import type { OrcamentoOpcao } from '../../types/orcamento';
import { formatCurrency, parseCurrency } from '../../utils/masks';

interface OpcaoOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  opcaoToEdit: OrcamentoOpcao | null;
}

export default function OpcaoOrcamentoModal({ isOpen, onClose, onSave, opcaoToEdit }: OpcaoOrcamentoModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (opcaoToEdit) {
        const formData = { ...opcaoToEdit };
        if (formData.valor_adicional) {
          formData.valor_adicional = formatCurrency(formData.valor_adicional);
        }
        reset(formData);
      } else {
        reset({ 
          ativo: true, 
          valor_adicional: '', 
          ordem: 0, 
          label: '', 
          descricao: '', 
          icone: '', 
          categoria: 'quantidade' 
        });
      }
    }
  }, [opcaoToEdit, isOpen, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const payload = { ...data };
      if (payload.valor_adicional) {
        payload.valor_adicional = parseCurrency(payload.valor_adicional);
      }

      if (opcaoToEdit) {
        await updateOrcamentoOpcao(opcaoToEdit.id, payload);
      } else {
        await createOrcamentoOpcao(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save option', error);
      alert('Erro ao salvar opção.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            {opcaoToEdit ? 'Editar Opção' : 'Nova Opção'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
              <select
                {...register('categoria', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="quantidade">Quantidade</option>
                <option value="prazo">Prazo</option>
                <option value="modelo">Modelo</option>
                <option value="estampa">Estampa</option>
                <option value="tecido">Tecido</option>
                <option value="adicional">Adicional</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Label (Texto) *</label>
              <input
                {...register('label', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Entre 15 e 49 unidades"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Adicional</label>
              <input
                {...register('valor_adicional')}
                onChange={(e) => {
                  e.target.value = formatCurrency(e.target.value);
                  setValue('valor_adicional', e.target.value);
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ícone (Emoji ou Nome)</label>
              <input
                {...register('icone')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: 👕 ou shirt"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ordem de Exibição</label>
              <input
                type="number"
                {...register('ordem')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                {...register('ativo')}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">Opção Ativa</span>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                {...register('descricao')}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Detalhes opcionais..."
              ></textarea>
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
