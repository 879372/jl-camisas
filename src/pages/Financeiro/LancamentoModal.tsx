import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Lancamento } from '../../types/financeiro';
import { financeiroService } from '../../services/financeiro';
import { formatCurrency, parseCurrency } from '../../utils/masks';

interface LancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  lancamentoToEdit: Lancamento | null;
  fixedType: 'entrada' | 'saida' | null;
}

export function LancamentoModal({ isOpen, onClose, onSave, lancamentoToEdit, fixedType }: LancamentoModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Lancamento>>({
    defaultValues: {
      tipo: fixedType || 'entrada',
      forma_pagamento: 'pix',
      valor: 0
    }
  });

  const watchedValor = watch('valor');
  const watchedTipo = watch('tipo');

  useEffect(() => {
    if (lancamentoToEdit) {
      reset(lancamentoToEdit);
    } else {
      reset({
        tipo: fixedType || 'entrada',
        forma_pagamento: 'pix',
        valor: 0,
        descricao: ''
      });
    }
  }, [lancamentoToEdit, reset, isOpen, fixedType]);

  const onSubmit = async (data: Partial<Lancamento>) => {
    try {
      if (lancamentoToEdit) {
        await financeiroService.update(lancamentoToEdit.id, data);
      } else {
        await financeiroService.create({ ...data, tipo: watchedTipo });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save lancamento', error);
      alert('Erro ao salvar lançamento.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            {lancamentoToEdit ? 'Editar' : 'Novo'} {watchedTipo === 'entrada' ? 'Recebimento' : 'Pagamento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  type="text"
                  value={formatCurrency(watchedValor || 0).replace('R$', '').trim()}
                  onChange={(e) => setValue('valor', parseCurrency(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
              <input
                {...register('descricao', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Compra de matéria-prima"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select
                {...register('forma_pagamento')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                {...register('observacoes')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Detalhes adicionais..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-white ${
                watchedTipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirmar {watchedTipo === 'entrada' ? 'Recebimento' : 'Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
