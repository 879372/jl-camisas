import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Package, 
  Wallet, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Pedidos (Kanban)', path: '/pedidos', icon: <Layers size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={20} /> },
    { name: 'Financeiro', path: '/financeiro', icon: <Wallet size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
          JL
        </div>
        <span className="ml-3 font-semibold text-xl tracking-tight text-slate-800">Camisas</span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Gestão
        </div>
        
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {link.icon}
                </div>
                {link.name}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Settings size={20} className="mr-3 text-slate-400" />
          Configurações
        </button>
      </div>
    </aside>
  );
}
