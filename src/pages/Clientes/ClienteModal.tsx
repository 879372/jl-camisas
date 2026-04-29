import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Cliente } from '../../types/cliente';
import { clientesService } from '../../services/clientes';
import { formatCpfCnpj, formatTelefone, formatCEP, unmask } from '../../utils/masks';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  clienteToEdit: Cliente | null;
}

export function ClienteModal({ isOpen, onClose, onSave, clienteToEdit }: ClienteModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm<Partial<Cliente>>();

  useEffect(() => {
    if (clienteToEdit) {
      Object.keys(clienteToEdit).forEach((key) => {
        let val = clienteToEdit[key as keyof Cliente] as any;
        if (val) {
          if (key === 'cpf_cnpj') val = formatCpfCnpj(val);
          if (key === 'telefone') val = formatTelefone(val);
          if (key === 'cep') val = formatCEP(val);
        }
        setValue(key as keyof Cliente, val);
      });
    } else {
      reset({ tipo: 'fisica' });
    }
  }, [clienteToEdit, setValue, reset, isOpen]);

  const onSubmit = async (data: Partial<Cliente>) => {
    try {
      const payload = { ...data };
      if (payload.cpf_cnpj) payload.cpf_cnpj = unmask(payload.cpf_cnpj);
      if (payload.telefone) payload.telefone = unmask(payload.telefone);
      if (payload.cep) payload.cep = unmask(payload.cep);

      if (clienteToEdit) {
        await clientesService.update(clienteToEdit.id, payload);
      } else {
        await clientesService.create(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save cliente', error);
      alert('Erro ao salvar cliente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {clienteToEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo / Razão Social *</label>
              <input
                {...register('nome', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cliente</label>
              <select
                {...register('tipo')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
              <input
                {...register('cpf_cnpj')}
                onChange={(e) => {
                  e.target.value = formatCpfCnpj(e.target.value);
                  setValue('cpf_cnpj', e.target.value);
                }}
                maxLength={18}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input
                {...register('telefone')}
                onChange={(e) => {
                  e.target.value = formatTelefone(e.target.value);
                  setValue('telefone', e.target.value);
                }}
                maxLength={15}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
              <input
                {...register('data_nascimento')}
                type="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Endereço</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                  <input
                    {...register('cep')}
                    onChange={(e) => {
                      e.target.value = formatCEP(e.target.value);
                      setValue('cep', e.target.value);
                    }}
                    maxLength={9}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="00000-000"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logradouro</label>
                  <input
                    {...register('logradouro')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Rua, Avenida, etc"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                  <input
                    {...register('numero')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                  <input
                    {...register('complemento')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                  <input
                    {...register('bairro')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                    <input
                      {...register('cidade')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                    <input
                      {...register('uf')}
                      maxLength={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                {...register('observacoes')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Observações adicionais..."
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
