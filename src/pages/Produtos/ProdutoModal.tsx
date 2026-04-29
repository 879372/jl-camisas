import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Produto } from '../../types/produto';
import { produtosService } from '../../services/produtos';
import { formatCurrency, parseCurrency } from '../../utils/masks';

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  produtoToEdit: Produto | null;
}

export function ProdutoModal({ isOpen, onClose, onSave, produtoToEdit }: ProdutoModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm<Partial<Produto>>();

  useEffect(() => {
    if (produtoToEdit) {
      Object.keys(produtoToEdit).forEach((key) => {
        let val = produtoToEdit[key as keyof Produto] as any;
        if (key === 'preco_base' && val !== undefined) {
          val = formatCurrency(val);
        }
        setValue(key as keyof Produto, val);
      });
    } else {
      reset({ ativo: true, preco_base: 0, unidade: 'un' });
    }
  }, [produtoToEdit, setValue, reset, isOpen]);

  const onSubmit = async (data: Partial<Produto>) => {
    try {
      const payload = { ...data };
      if (typeof payload.preco_base === 'string') {
        payload.preco_base = parseCurrency(payload.preco_base);
      }

      if (produtoToEdit) {
        await produtosService.update(produtoToEdit.id, payload);
      } else {
        await produtosService.create(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save produto', error);
      alert('Erro ao salvar produto.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {produtoToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto *</label>
              <input
                {...register('nome', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Camiseta Sublimação Branca"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida</label>
              <select
                {...register('unidade')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="un">Unidade (un)</option>
                <option value="m">Metro (m)</option>
                <option value="m2">Metro Quadrado (m²)</option>
                <option value="cm">Centímetro (cm)</option>
                <option value="kg">Quilo (kg)</option>
                <option value="pct">Pacote (pct)</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Base *</label>
              <input
                {...register('preco_base', { required: true })}
                onChange={(e) => {
                  e.target.value = formatCurrency(e.target.value);
                  setValue('preco_base', e.target.value);
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <div className="flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  {...register('ativo')}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Produto Ativo</span>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Detalhes sobre o produto, material, etc..."
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
