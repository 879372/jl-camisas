import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User, Package, Calendar, Shirt, Palette, Layers, Sparkles, CheckCircle,
  ChevronRight, ChevronLeft, Send, Info, Check, RotateCw
} from 'lucide-react';
import { getOrcamentoConfig, getOrcamentoOpcoes, criarPedidoPublico } from '../../services/orcamento';
import './orcamento.css';
import type { OrcamentoOpcao } from '../../types/orcamento';

interface OrcamentoData {
  nome: string;
  whatsapp: string;
  quantidade: string;
  prazo: string;
  modelo: string;
  estampa: string;
  tecido: string;
  adicionais: string[];
}

const steps = [
  { id: 1, label: 'Dados', icon: User },
  { id: 2, label: 'Quantidade', icon: Package },
  { id: 3, label: 'Prazo', icon: Calendar },
  { id: 4, label: 'Modelo', icon: Shirt },
  { id: 5, label: 'Estampa', icon: Palette },
  { id: 6, label: 'Tecido', icon: Layers },
  { id: 7, label: 'Adicionais', icon: Sparkles },
  { id: 8, label: 'Resumo', icon: CheckCircle },
];

const Orcamento: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('aba') || '1');
  const orcamentoId = searchParams.get('orcamento_id') || '16008';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['orcamento-public-config'],
    queryFn: async () => {
      const data = await getOrcamentoConfig();
      return data.results?.[0] || null;
    }
  });

  const { data: opcoesRaw } = useQuery({
    queryKey: ['orcamento-public-opcoes'],
    queryFn: async () => {
      const data = await getOrcamentoOpcoes({ ativo: true });
      return data.results || [];
    }
  });

  const opcoes = useMemo(() => {
    const map: Record<string, OrcamentoOpcao[]> = {
      quantidade: [],
      prazo: [],
      modelo: [],
      estampa: [],
      tecido: [],
      adicional: [],
    };
    opcoesRaw?.forEach((opt: OrcamentoOpcao) => {
      if (map[opt.categoria]) map[opt.categoria].push(opt);
    });
    return map;
  }, [opcoesRaw]);

  const [formData, setFormData] = useState<OrcamentoData>({
    nome: '',
    whatsapp: '',
    quantidade: '',
    prazo: '',
    modelo: '',
    estampa: '',
    tecido: '',
    adicionais: [],
  });

  const nextStep = () => {
    if (currentStep < 8) {
      setSearchParams({ orcamento_id: orcamentoId, aba: (currentStep + 1).toString() });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setSearchParams({ orcamento_id: orcamentoId, aba: (currentStep - 1).toString() });
    }
  };

  const updateField = (field: keyof OrcamentoData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAdicional = (adicional: string) => {
    setFormData(prev => {
      if (prev.adicionais.includes(adicional)) {
        return { ...prev, adicionais: prev.adicionais.filter(a => a !== adicional) };
      }
      return { ...prev, adicionais: [...prev.adicionais, adicional] };
    });
  };

  const calculateTotal = () => {
    let total = parseFloat(config?.valor_base || '50');

    // Check extra value for selected options
    const selectedOptions = [
      ...opcoes.quantidade.filter(o => o.label === formData.quantidade),
      ...opcoes.prazo.filter(o => o.label === formData.prazo),
      ...opcoes.modelo.filter(o => o.label === formData.modelo),
      ...opcoes.estampa.filter(o => o.label === formData.estampa),
      ...opcoes.tecido.filter(o => o.label === formData.tecido),
      ...opcoes.adicional.filter(o => formData.adicionais.includes(o.label)),
    ];

    selectedOptions.forEach(opt => {
      total += Number(opt.valor_adicional || 0);
    });

    return total;
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Cria o pedido no backend (painel kanban)
      const valorTotal = calculateTotal();
      const payload = {
        ...formData,
        valor_total: valorTotal
      };
      await criarPedidoPublico(payload);

      // 2. Prepara a mensagem do WhatsApp
      let message = config?.mensagem_template || "Olá, meu nome é {nome} e realizei um orçamento pelo site.";
      message = message.replace('{nome}', formData.nome);

      const detailText = `
*Detalhes do Pedido:*
• *Quantidade:* ${formData.quantidade}
• *Modelo:* ${formData.modelo}
• *Estampa:* ${formData.estampa}
• *Malha:* ${formData.tecido}
• *Adicionais:* ${formData.adicionais.join(' | ') || 'Nenhum'} | Valor unitário: R$ ${valorTotal.toFixed(2).replace('.', ',')}
• *Prazo de Entrega:* ${formData.prazo}`;

      const fullMessage = message + detailText;
      const encodedMessage = encodeURIComponent(fullMessage);

      // Limpa o número do cliente (remove (), -, espaços)
      const cleanNumber = formData.whatsapp.replace(/\D/g, '');

      // Adiciona o código do país (55) para o link do WhatsApp
      const finalNumber = `55${cleanNumber}`;

      const whatsappUrl = `https://wa.me/${finalNumber}?text=${encodedMessage}`;

      // Abrir o WhatsApp
      window.location.href = whatsappUrl; // Usa href em vez de window.open para evitar bloqueio de popup após req async
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Houve um erro ao processar seu pedido. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config && !opcoesRaw) {
    return (
      <div className="orcamento-page flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="orcamento-page flex flex-col items-center min-h-screen py-4 md:py-8 px-4 selection:bg-yellow-500/30">

      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full opacity-50" />
      </div>

      {/* Header */}
      <header className="relative z-10 mb-6 md:mb-10 text-center animate-step">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <img
              src="/image.png"
              alt="JL Arte Camisas"
              className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] rounded-lg"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase italic">
            JL <span className="text-yellow-500">Arte Camisas</span>
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto mt-2 rounded-full" />
        </div>
      </header>

      {/* Modern Stepper */}
      <div className="relative z-10 w-full max-w-5xl mb-12 hidden md:block animate-step" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-center px-4">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center group relative flex-1">
                {step.id < 8 && (
                  <div className={`absolute top-6 left-[60%] right-[-40%] h-[2px] transition-all duration-500 ${isCompleted ? 'bg-yellow-500' : 'bg-slate-700'
                    }`} />
                )}
                <div className={`w-7 h-7 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 relative z-10 ${isActive ? 'bg-yellow-500 border-yellow-500 text-white scale-110 step-indicator-active' :
                  isCompleted ? 'bg-yellow-500 border-yellow-500 text-white' :
                    'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-white' : 'text-slate-500'
                  }`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden w-full max-w-md glass-card rounded-2xl p-4 mb-8 animate-step relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500">Step {currentStep} of 8</span>
            <h3 className="text-base font-semibold text-white">{steps[currentStep - 1].label}</h3>
          </div>
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
            {(() => { const Icon = steps[currentStep - 1].icon; return <Icon className="w-5 h-5" />; })()}
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all duration-500 progress-fill"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <main className="relative z-10 w-full max-w-4xl glass-card rounded-2xl md:rounded-xl p-5 md:p-8 animate-step" style={{ animationDelay: '0.4s' }}>

        {currentStep === 1 && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">VAMOS DAR <span className="text-yellow-500">VIDA</span> À SUA IDEIA?</h2>
                <p className="mt-2 text-slate-400 font-medium">Inicie seu projeto exclusivo com a JL Arte Camisas preenchendo os dados abaixo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="group space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 ml-2">Seu Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: José Kaio"
                  className="w-full h-12 md:h-14 px-8 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all outline-none text-base font-semibold"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                />
              </div>
              <div className="group space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 ml-2">WhatsApp para Contato</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full h-12 md:h-14 px-8 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all outline-none text-base font-semibold"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.substring(0, 11);
                    let formatted = val;
                    if (val.length > 2) formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
                    if (val.length > 7) {
                      // Trata 8 ou 9 dígitos no número
                      if (val.length <= 10) {
                        formatted = `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`;
                      } else {
                        formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
                      }
                    }
                    updateField('whatsapp', formatted);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">VOLUME DO <span className="text-yellow-500">PEDIDO</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Selecione a quantidade para que possamos otimizar os custos.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opcoes.quantidade.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('quantidade', opt.label)}
                  className={`option-card p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${formData.quantidade === opt.label ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.quantidade === opt.label ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'
                    }`}>
                    {formData.quantidade === opt.label && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-black text-white text-sm md:text-base uppercase italic">{opt.label}</span>
                </button>
              ))}
              {opcoes.quantidade.length === 0 && <p className="text-slate-500">Nenhuma opção configurada.</p>}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">CRONOGRAMA DE <span className="text-yellow-500">ENTREGA</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Trabalhamos com agilidade. Qual o seu prazo?</p>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                A excelência leva tempo. Contamos em <b className="text-yellow-500 uppercase">dias úteis</b> para garantir que cada peça passe por nosso rigoroso controle de qualidade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opcoes.prazo.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('prazo', opt.label)}
                  className={`option-card p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${formData.prazo === opt.label ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.prazo === opt.label ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'
                    }`}>
                    {formData.prazo === opt.label && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-black text-white text-sm md:text-base uppercase italic">{opt.label}</span>
                </button>
              ))}
              {opcoes.prazo.length === 0 && <p className="text-slate-500">Nenhuma opção configurada.</p>}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">CATÁLOGO DE <span className="text-yellow-500">MODELOS</span></h2>
              <p className="mt-2 text-slate-400 font-medium">O corte perfeito para o seu estilo.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {opcoes.modelo.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('modelo', opt.label)}
                  className={`option-card p-4 md:p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-4 ${formData.modelo === opt.label ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800/80 rounded-xl flex items-center justify-center text-4xl shadow-xl">
                    {opt.icone || '👕'}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm md:text-base uppercase italic">{opt.label}</h3>
                    <p className="hidden md:block text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{opt.descricao}</p>
                  </div>
                </button>
              ))}
              {opcoes.modelo.length === 0 && <p className="text-slate-500">Nenhum modelo configurado.</p>}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">TECNOLOGIA DE <span className="text-yellow-500">ESTAMPA</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Qualidade visual impecável em cada detalhe.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opcoes.estampa.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('estampa', opt.label)}
                  className={`option-card p-8 md:p-12 rounded-[40px] border-2 text-center transition-all ${formData.estampa === opt.label ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-6 ${formData.estampa === opt.label ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'
                    }`}>
                    {formData.estampa === opt.label && <Check className="w-6 h-6 text-white" />}
                  </div>
                  <span className="font-black text-white text-xl md:text-2xl uppercase italic tracking-tight">{opt.label}</span>
                  <p className="mt-2 text-slate-500 text-xs uppercase font-bold tracking-widest">{opt.descricao || 'Garantia de durabilidade'}</p>
                </button>
              ))}
              {opcoes.estampa.length === 0 && <p className="text-slate-500">Nenhuma estampa configurada.</p>}
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">SELEÇÃO DE <span className="text-yellow-500">TECIDOS</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Conforto e performance superior.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {opcoes.tecido.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('tecido', opt.label)}
                  className={`option-card p-4 md:p-5 rounded-2xl border-2 text-left transition-all ${formData.tecido === opt.label ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <span className="font-black text-white text-sm md:text-base uppercase italic">{opt.label}</span>
                </button>
              ))}
              {opcoes.tecido.length === 0 && <p className="text-slate-500">Nenhum tecido configurado.</p>}
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">RECURSOS <span className="text-yellow-500">ADICIONAIS</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Ajuste cada detalhe para um resultado exclusivo.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opcoes.adicional.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleAdicional(opt.label)}
                  className={`option-card p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.adicionais.includes(opt.label) ? 'option-card-selected' : 'bg-slate-800/30 border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${formData.adicionais.includes(opt.label) ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'
                      }`}>
                      {formData.adicionais.includes(opt.label) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-black text-white text-sm md:text-base uppercase italic">{opt.label}</span>
                  </div>
                  <span className="text-yellow-500 font-black text-sm">
                    {opt.valor_adicional > 0 ? `+R$ ${Number(opt.valor_adicional).toFixed(0)}` : 'Grátis'}
                  </span>
                </button>
              ))}
              {opcoes.adicional.length === 0 && <p className="text-slate-500">Nenhum adicional configurado.</p>}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center">
              <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Estimativa por Unidade</span>
              <div className="text-5xl md:text-7xl font-black text-white mt-2 italic">
                R$ <span className="text-yellow-500">{calculateTotal().toFixed(2).split('.')[0]}</span><span className="text-lg text-yellow-500/60">,{calculateTotal().toFixed(2).split('.')[1]}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">CONFIRMAÇÃO DO <span className="text-yellow-500">PROJETO</span></h2>
              <p className="mt-2 text-slate-400 font-medium">Revise seu projeto profissional antes do fechamento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  {[
                    { label: 'Cliente', value: formData.nome, icon: User },
                    { label: 'WhatsApp', value: formData.whatsapp, icon: Send },
                    { label: 'Quantidade', value: formData.quantidade, icon: Package },
                    { label: 'Prazo', value: formData.prazo, icon: Calendar },
                    { label: 'Modelo', value: formData.modelo, icon: Shirt },
                    { label: 'Tecido', value: formData.tecido, icon: Layers },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-white font-bold text-lg leading-tight">{item.value || '---'}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 flex items-start gap-4">
                  <Info className="w-6 h-6 text-yellow-500 shrink-0" />
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Este orçamento é uma estimativa baseada em tecnologias padrão. Ajustes finais podem ocorrer após análise da sua arte exclusiva por nosso time de design.
                  </p>
                </div>
              </div>

              <div className="glass-card bg-yellow-500/5 border-yellow-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Valor Final/Unid</span>
                <div className="text-5xl font-black text-white mt-2 italic">
                  R$ <span className="text-yellow-500">{calculateTotal().toFixed(2).split('.')[0]}</span>
                </div>
                <div className="mt-8 w-full h-[1px] bg-yellow-500/20" />
                <div className="mt-8 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Fast Production</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row gap-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="h-14 md:h-16 px-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all order-2 md:order-1 text-sm md:text-base"
            >
              <ChevronLeft className="w-6 h-6" /> Voltar
            </button>
          )}

          <button
            onClick={currentStep < 8 ? nextStep : handleFinish}
            disabled={isSubmitting}
            className={`flex-1 h-14 md:h-16 btn-primary text-white rounded-xl font-bold uppercase tracking-wider italic text-base md:text-lg flex items-center justify-center gap-3 transition-all order-1 md:order-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {currentStep === 8 ? (
              isSubmitting ? <><RotateCw className="w-6 h-6 animate-spin" /> ENVIANDO...</> : <><Send className="w-6 h-6" /> FINALIZAR PROJETO</>
            ) : currentStep === 7 ? (
              'GERAR RESUMO'
            ) : (
              <><ChevronRight className="w-6 h-6" /> CONTINUAR</>
            )}
          </button>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="relative z-10 mt-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left pb-12 opacity-50">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Endereço</p>
          <p className="text-xs text-slate-400">R. Monte Gerezim, 171 - CENTRAL PARK 1<br />Extremoz - RN, 59575-000</p>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Horário</p>
          <p className="text-xs text-slate-400">Segunda à Sexta: 08:00 – 18:00<br />Sábado: 08:00 – 17:00 | Domingo: Fechado</p>
        </div>
        <div className="space-y-2 text-center md:text-right">
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Contato</p>
          <p className="text-xs text-slate-400">(84) 98617-2153<br />contato@jlartecamisas.com.br</p>
        </div>
      </footer>
    </div>
  );
};

export default Orcamento;
