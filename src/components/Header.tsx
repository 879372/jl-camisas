import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 flex-shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex h-full items-center justify-between px-6 lg:px-8">
        
        {/* Search */}
        <div className="flex flex-1 items-center max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full py-2 pl-10 pr-4 text-sm transition-all duration-300" 
              placeholder="Buscar pedidos, clientes..." 
            />
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
          {/* User Profile */}
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-slate-700 leading-tight">Admin JL</span>
              <span className="text-xs text-slate-500">Administrador</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-300">
              AD
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
