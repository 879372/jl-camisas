export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400 opacity-20 blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/30 mb-6">
              JL
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bem-vindo</h2>
            <p className="text-slate-500 mt-2">Faça login para gerenciar a gráfica</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-mail</label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none transition-all duration-300" 
                placeholder="admin@jlcamisas.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none transition-all duration-300" 
                placeholder="••••••••"
              />
            </div>

            <button type="button" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-4 py-3.5 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Entrar
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-slate-500 mt-8">
          Sistema de Gestão &copy; {new Date().getFullYear()} JL Camisas
        </p>
      </div>
    </div>
  );
}
