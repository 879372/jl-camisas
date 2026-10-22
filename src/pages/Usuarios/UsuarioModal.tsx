import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { usuariosService } from '../../services/usuarios';
import type { Usuario, UsuarioForm } from '../../types/usuario';

interface UsuarioModalProps {
  isOpen: boolean;
  user: Usuario | null;
  onClose: () => void;
  onSave: () => void;
}

export default function UsuarioModal({ isOpen, user, onClose, onSave }: UsuarioModalProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UsuarioForm>();

  useEffect(() => {
    if (!isOpen) return;
    reset(user ? {
      username: user.username,
      email: user.email,
      name: user.name,
      profile: user.profile,
      is_active: user.is_active,
      password: '',
    } : {
      username: '', email: '', name: '', profile: 'operacional', is_active: true, password: '',
    });
  }, [isOpen, user, reset]);

  const onSubmit = async (values: UsuarioForm) => {
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    if (user) {
      await usuariosService.update(user.id, payload);
    } else {
      if (!values.password) throw new Error('Senha obrigatória');
      await usuariosService.create(values);
    }
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-semibold">{user ? 'Editar usuário' : 'Novo usuário'}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 p-6">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Nome *</label>
            <input {...register('name', { required: true })} className="w-full rounded-lg border border-slate-200 px-4 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Usuário *</label>
            <input {...register('username', { required: true })} className="w-full rounded-lg border border-slate-200 px-4 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input type="email" {...register('email')} className="w-full rounded-lg border border-slate-200 px-4 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Perfil *</label>
            <select {...register('profile', { required: true })} className="w-full rounded-lg border border-slate-200 px-4 py-2">
              <option value="admin">Administrador</option>
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
              <option value="vendas">Vendas</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{user ? 'Nova senha' : 'Senha *'}</label>
            <input type="password" {...register('password', { required: !user, minLength: 8 })} className="w-full rounded-lg border border-slate-200 px-4 py-2" />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} /> Usuário ativo
          </label>
          <div className="col-span-2 mt-3 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
