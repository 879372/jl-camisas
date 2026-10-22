import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { usuariosService } from '../../services/usuarios';
import type { Usuario } from '../../types/usuario';
import UsuarioModal from './UsuarioModal';

const profileLabels: Record<string, string> = {
  admin: 'Administrador', operacional: 'Operacional', financeiro: 'Financeiro', vendas: 'Vendas',
};

export default function Usuarios() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await usuariosService.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 0);
    return () => clearTimeout(timer);
  }, []);

  const remove = async (user: Usuario) => {
    if (!window.confirm(`Excluir o usuário ${user.name}?`)) return;
    await usuariosService.delete(user.id);
    await loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários e permissões</h1>
          <p className="text-sm text-slate-500">Gerencie acessos por perfil operacional.</p>
        </div>
        <button onClick={() => { setSelected(null); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">
          <Plus className="h-4 w-4" /> Novo usuário
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-4">Usuário</th><th>Perfil</th><th>Status</th><th className="px-6 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando...</td></tr> : users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4"><div className="flex items-center gap-3"><Users className="h-4 w-4 text-blue-500" /><div><div className="font-medium">{user.name}</div><div className="text-xs text-slate-400">{user.username} · {user.email}</div></div></div></td>
                <td>{profileLabels[user.profile]}</td>
                <td>{user.is_active ? <span className="text-emerald-600">Ativo</span> : <span className="text-slate-400">Inativo</span>}</td>
                <td className="px-6 text-right"><button onClick={() => { setSelected(user); setOpen(true); }} className="p-2 text-blue-600"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(user)} className="p-2 text-red-500"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UsuarioModal isOpen={open} user={selected} onClose={() => setOpen(false)} onSave={loadUsers} />
    </div>
  );
}
