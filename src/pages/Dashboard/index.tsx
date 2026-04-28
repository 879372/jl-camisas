export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Cards */}
        {[
          { label: 'Faturamento do Mês', value: 'R$ 14.500,00', color: 'from-emerald-400 to-emerald-600' },
          { label: 'Pedidos em Produção', value: '24', color: 'from-blue-400 to-blue-600' },
          { label: 'Orçamentos Pendentes', value: '8', color: 'from-amber-400 to-amber-600' },
          { label: 'Entregues Hoje', value: '12', color: 'from-purple-400 to-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-bl-full opacity-10 group-hover:scale-110 transition-transform duration-500`}></div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 flex items-center justify-center text-slate-400">
          Gráfico de Pedidos (Em Breve)
        </div>
        <div className="h-96 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 flex items-center justify-center text-slate-400">
          Alertas e Prazos (Em Breve)
        </div>
      </div>
    </div>
  );
}
