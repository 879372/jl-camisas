export default function Financeiro() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Novo Lançamento
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-center text-slate-500">
        Módulo Financeiro em desenvolvimento.
      </div>
    </div>
  );
}
