import { X, FileText, ShoppingBag, Ban } from 'lucide-react';

interface FiscalPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'nfe' | 'nfce' | 'none') => void;
  pedidoNumero: string;
}

export function FiscalPromptModal({ isOpen, onClose, onConfirm, pedidoNumero }: FiscalPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Emissão de Nota Fiscal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Pedido #{pedidoNumero} Concluído!</h4>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Deseja emitir nota fiscal para este pedido agora? A emissão é opcional e pode ser feita posteriormente.
          </p>

          <div className="grid gap-3">
            <button
              onClick={() => onConfirm('nfe')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">Emitir NF-e</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Nota Fiscal Eletrônica (Produtos)</div>
              </div>
            </button>

            <button
              onClick={() => onConfirm('nfce')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">Emitir NFC-e</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Consumidor Final (Venda Rápida)</div>
              </div>
            </button>

            <button
              onClick={() => onConfirm('none')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-500 group-hover:text-white transition-colors">
                <Ban className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">Não emitir agora</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Concluir sem gerar nota fiscal</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
