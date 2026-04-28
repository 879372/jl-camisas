export default function Pedidos() {
  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kanban de Pedidos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie o fluxo de produção arrastando os cards.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20">
          + Novo Pedido
        </button>
      </div>
      
      {/* Kanban Board Placeholder */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {['Orçamentos', 'Aguardando Pagamento', 'Em Produção', 'Concluídos'].map((coluna) => (
          <div key={coluna} className="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700 flex justify-between items-center">
                {coluna}
                <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">0</span>
              </h3>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-400">
                Arraste pedidos para cá
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
