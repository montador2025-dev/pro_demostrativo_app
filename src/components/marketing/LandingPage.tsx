import React, { useState } from 'react';
import { 
  ArrowRight, 
  Store, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Monitor, 
  FileText, 
  ShieldCheck, 
  Play, 
  HelpCircle,
  Plus, 
  Minus,
  Briefcase
} from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  // Active pillar for the deep-dive interactive switcher
  const [activeSegment, setActiveSegment] = useState<'sales' | 'manager' | 'supervisor'>('sales');
  
  // Simple interactive budget simulation inside the landing page to hook clients!
  const [testRoom, setTestRoom] = useState<string>('living');
  const [testWood, setTestWood] = useState<number>(3500); // base price
  const [testDelivery, setTestDelivery] = useState<boolean>(true);
  const [installments, setInstallments] = useState<number>(12);

  const rooms = [
    { id: 'living', name: 'Sala de Estar', base: 4500, desc: 'Painéis ripados, racks e nichos sob medida.' },
    { id: 'kitchen', name: 'Cozinha Planejada', base: 7800, desc: 'Armários em MDF duplo, gaveteiros com amortecedor.' },
    { id: 'bedroom', name: 'Quarto de Casal', base: 6200, desc: 'Guarda-roupa embutido com portas de correr e espelho.' },
    { id: 'bathroom', name: 'Gabinete de Banheiro', base: 1800, desc: 'Compacto com gaveteiro e nicho para espelho.' }
  ];

  const currentRoom = rooms.find(r => r.id === testRoom) || rooms[0];
  const calculatedTotal = (currentRoom.base + testWood) * (testDelivery ? 1.08 : 1.0);
  const installmentValue = calculatedTotal / installments;

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      
      {/* Decorative Warm Ambient Glow Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-40 z-0">
        <div className="absolute -top-[20%] left-[15%] w-[450px] h-[450px] bg-amber-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-stone-300/30 rounded-full blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#faf9f5]/80 border-b border-stone-200/60 transitioning-all px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center shadow-lg shadow-amber-700/10 text-white font-extrabold text-lg tracking-wider">
              RC
            </div>
            <div>
              <span className="font-sans font-black text-[15px] sm:text-[17px] tracking-tight text-stone-900 block uppercase">
                Radar<span className="text-amber-700">Conquista</span>
              </span>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest block -mt-1 leading-none">
                Sono Show Móveis S/A
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a href="#solucoes" className="hover:text-amber-700 transition-colors">Soluções</a>
            <a href="#simulador" className="hover:text-amber-700 transition-colors">Simulador Interno</a>
            <a href="#pilares" className="hover:text-amber-700 transition-colors">Níveis de Acesso</a>
            <a href="#seguranca" className="hover:text-amber-700 transition-colors">Infraestrutura</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={onEnterPortal}
              id="landing-navbar-login-btn"
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-stone-900 text-stone-100 hover:bg-amber-700 hover:text-white transition-all shadow-md shadow-stone-950/5 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              Acessar Portal 
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Super Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 md:pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            Inteligência de Vendas de Móveis & Design Planejado
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black text-stone-900 tracking-tight leading-[1.1] max-w-4xl">
            O ecossistema que transforma orçamentos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600">vendas fechadas</span>.
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-stone-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Integração total do consultor de loja ao supervisor master. Simulações rápidas de parcelamento, catálogos interativos, geração de PDFs e auditoria em tempo real para a rede <strong>Sono Show Móveis</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterPortal}
              id="hero-cta-portal"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-700 text-white font-extrabold uppercase text-xs tracking-wider hover:bg-amber-800 shadow-xl shadow-amber-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              Iniciar Painel Corporativo
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#simulador"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-stone-300 text-stone-700 bg-white font-bold uppercase text-xs tracking-wider hover:bg-stone-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-stone-500" />
              Ver Simulador de Testes
            </a>
          </div>

          {/* Value Highlights */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="p-3 bg-white border border-stone-200/80 rounded-xl shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-amber-700">+40%</p>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Conversão de Leads</p>
            </div>
            <div className="p-3 bg-white border border-stone-200/80 rounded-xl shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-stone-800">&lt; 3min</p>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Montagem de Proposta</p>
            </div>
            <div className="p-3 bg-white border border-stone-200/80 rounded-xl shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-stone-800">100%</p>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Auditoria de Log</p>
            </div>
            <div className="p-3 bg-white border border-stone-200/80 rounded-xl shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-amber-700">Real-Time</p>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sincronização Nuvem</p>
            </div>
          </div>
        </div>

        {/* Dynamic & Immersive Application Dashboard Mockup */}
        <div id="solucoes" className="mt-16 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto animate-fade-in relative">
          {/* Mock Window Chromes */}
          <div className="bg-stone-100 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400 block"></span>
              <span className="w-3 h-3 rounded-full bg-green-400 block"></span>
            </div>
            <div className="bg-stone-200/60 rounded-md px-16 py-1 text-[10px] font-mono text-stone-500 tracking-wider">
              radarconquista.sonoshow.com.br/painel
            </div>
            <div className="w-8"></div>
          </div>

          {/* Mock Dashboard Body */}
          <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-stone-50">
            {/* Left Column: Metrics & Shortcuts */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block font-sans">
                  Sua Unidade: Matriz Showroom
                </span>
                <p className="text-sm font-bold text-stone-800">Status Geral do Mês</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Meta de Vendas</span>
                    <span className="font-bold text-stone-800">R$ 120.000,00</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-700 h-full w-[78%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-stone-400 text-right">R$ 93.600,00 fechados (78%)</p>
                </div>
              </div>

              <div className="bg-[#1b1c1d] text-stone-200 p-4 rounded-xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Atividade Real-time</p>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  <p className="text-emerald-400">&gt; Patrícia L.: Orçamento Fechado! R$ 5.900,00</p>
                  <p className="text-amber-400">&gt; Carlos S. (Supervisor) alterou política de taxas</p>
                  <p className="text-stone-400">&gt; Ana V.: Novo Consultor cadastrado com sucesso</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Lead / Budget Simulator Mockup */}
            <div className="md:col-span-8 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-stone-800">Contratos & Propostas de Atendimento</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                    Aprovados
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-700">Marta Ferreira Cruz</p>
                      <p className="text-[10px] text-stone-400">Sala de jantar + Aparador - 10x de R$ 380,00</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">R$ 3.800,00</span>
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-700">Renato G. Albuquerque</p>
                      <p className="text-[10px] text-stone-400">Cozinha Provençal Planejada - À vista</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">R$ 11.200,00</span>
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-700">Giselle M. Souza</p>
                      <p className="text-[10px] text-stone-400">Quarto Infantil modulado - Entrada + 5x</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">R$ 4.350,00</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Visualizando 3 de 142 orçamentos sincronizados</span>
                <span className="text-amber-700 font-bold hover:underline cursor-pointer" onClick={onEnterPortal}>
                  Ver todos os orçamentos &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section (Hook Simulator) */}
      <section id="simulador" className="bg-[#f0ede6] border-y border-stone-200 py-16 px-4 sm:px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-stone-300 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-stone-500" />
              Experimente em Tempo Real
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-sans font-black text-stone-900 tracking-tight">
              Simulador Instantâneo para Fechamento Rápido.
            </h2>
            
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Diga adeus às planilhas complexas e de difícil entendimento para o consumidor. O vendedor configura o ambiente na frente do cliente, insere complementos opcionais, aplica o desconto autorizado e exibe o parcelamento final com um clique.
            </p>

            <div className="space-y-3.5">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-stone-600 text-sm">
                  <strong>Simplicidade na negociação:</strong> Ofereça opções com transparência extrema para o consumidor.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-stone-600 text-sm">
                  <strong>Integração com WhatsApp:</strong> Compartilhe o link do orçamento detalhado, formatado com negrito e bullet points automaticamente.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-stone-600 text-sm">
                  <strong>Controle de Desconto:</strong> Evite estouro de margem com tetos inteligentes controlados centralmente pela diretoria.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Simulator Widget */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xl space-y-6">
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                Mecanismo de Cálculo Ativo
              </p>
              <h3 className="text-lg font-extrabold text-stone-800">
                Monte e Calcule uma Proposta Modelo:
              </h3>
            </div>

            {/* Room choice cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setTestRoom(r.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    testRoom === r.id 
                    ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-700' 
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <p className={`text-[11px] font-bold ${testRoom === r.id ? 'text-amber-900' : 'text-stone-700'}`}>
                    {r.name}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5 font-mono">
                    R$ {r.base.toLocaleString('pt-BR')}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-3 bg-stone-50 rounded-lg text-[11px] text-stone-500 leading-relaxed border border-stone-100">
              <strong>Estrutura:</strong> {currentRoom.desc}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wood parameter multiplier slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-stone-600">
                  <span>Adicional de Ferragens & Acabamento</span>
                  <span className="font-mono text-amber-700">R$ {testWood.toLocaleString('pt-BR')}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="500"
                  value={testWood}
                  onChange={(e) => setTestWood(parseInt(e.target.value))}
                  className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-stone-400 font-bold uppercase">
                  <span>MDF Comum</span>
                  <span>MDF Alta Densidade + Escorregamento VIP</span>
                </div>
              </div>

              {/* Installments slider or check */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-stone-600">
                  <span>Opção de Parcelamento</span>
                  <span className="font-mono text-stone-800">{installments} parcelas</span>
                </div>
                <div className="flex gap-2">
                  {[1, 3, 6, 10, 12, 18, 24].map((inst) => (
                    <button
                      key={inst}
                      onClick={() => setInstallments(inst)}
                      className={`flex-1 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
                        installments === inst 
                        ? 'bg-amber-700 text-white shadow-sm' 
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      {inst}x
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-stone-400">
                  * Acima de 12x pode incidir taxas do emissor do cartão.
                </div>
              </div>
            </div>

            {/* Checkbox for delivery & assembly */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 bg-stone-50/50">
              <input
                id="landing-test-delivery"
                type="checkbox"
                checked={testDelivery}
                onChange={(e) => setTestDelivery(e.target.checked)}
                className="w-4 h-4 text-amber-700 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="landing-test-delivery" className="text-xs font-sans text-stone-600 cursor-pointer select-none">
                <strong>Solicitar Frete Premium & Montagem Técnica (+8%):</strong> Equipe própria entrega e monta em até 7 dias úteis após faturamento.
              </label>
            </div>

            {/* Simulated result box */}
            <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest block">
                  Simulação de Fechamento Radar
                </span>
                <p className="text-[10px] text-stone-400">Valor Total à Vista:</p>
                <p className="text-3xl font-black text-amber-900 tracking-tight">
                  R$ {calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="w-full sm:w-auto p-4 bg-white rounded-lg border border-amber-200/50 text-center sm:text-right shadow-sm space-y-0.5">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Parcelamento Proposto
                </span>
                <p className="text-stone-500 text-xs">{installments}x iguais de</p>
                <p className="text-xl font-bold text-stone-800 font-mono">
                  R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Sem juros no boleto</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onEnterPortal}
                className="flex-1 py-3 bg-stone-900 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl hover:bg-stone-800 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                Gerar PDF deste Orçamento Oficial
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Role Segments Matrix (The Pillars) */}
      <section id="pilares" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Controle de Hierarquia Avançado</p>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-stone-900 tracking-tight">
            Uma ferramento construída para todos os níveis de hierarquia
          </h2>
          <p className="text-stone-500 text-sm sm:text-base">
            O ecossistema divide as responsabilidade e garante ferramentas extremamente cirúrgicas de acordo com o nível organizacional.
          </p>
        </div>

        {/* Pillars Segment Navigation Switcher */}
        <div className="flex items-center justify-center gap-2.5 max-w-lg mx-auto bg-stone-200/50 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveSegment('sales')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'sales'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            🧑‍💼 Consultores
          </button>
          <button
            onClick={() => setActiveSegment('manager')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'manager'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            🏢 Gerentes Laj
          </button>
          <button
            onClick={() => setActiveSegment('supervisor')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'supervisor'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            🛡️ Diretores
          </button>
        </div>

        {/* Selected Pillar Detailed Tab Window */}
        <div className="bg-white border border-stone-200 shadow-lg rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto min-h-[300px]">
          {activeSegment === 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="md:col-span-7 space-y-4">
                <span className="p-1 px-2 text-[9px] font-bold text-amber-800 bg-amber-100 rounded uppercase tracking-wider">
                  Nível de Acesso 1 - Consultor de Vendas
                </span>
                <h3 className="text-2xl font-black text-stone-800 leading-tight">
                  Calculadora Ágil na Loja e no Smartphone.
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Projetada especificamente para o dia a dia acelerado de atendimento. A interface de smartphone funciona sem travamento e permite que o vendedor lance peças e salve dados enquanto conversa com o cliente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 font-semibold pt-2">
                  <p className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-amber-700" /> Compatibilidade Mobile Total</p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-700" /> Histórico Pessoal de Clientes</p>
                  <p className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-700" /> Criação Dinâmica de PDFs</p>
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-700" /> WhatsApp Link com um clique</p>
                </div>
              </div>
              <div className="md:col-span-5 bg-gradient-to-br from-stone-50 to-stone-100 p-6 rounded-xl border border-stone-200/60 flex flex-col justify-center text-center">
                <Smartphone className="w-16 h-16 text-stone-400 mx-auto stroke-[1.2] mb-3" />
                <p className="text-xs font-bold text-stone-700">90% dos Orçamentos salvos via Celular</p>
                <p className="text-[10px] text-stone-400 mt-1 max-w-xs mx-auto">Nenhum rascunho de papel é perdido. O cliente sai com orçamentos digitais no celular.</p>
              </div>
            </div>
          )}

          {activeSegment === 'manager' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="md:col-span-7 space-y-4">
                <span className="p-1 px-2 text-[9px] font-bold text-emerald-800 bg-emerald-100 rounded uppercase tracking-wider">
                  Nível de Acesso 2 - Gerência de Loja (Filial)
                </span>
                <h3 className="text-2xl font-black text-stone-800 leading-tight">
                  Auditoria de Atendimento & Reatribuição de Clientes.
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Permite supervisionar todos os representantes da loja em tempo real. Se um consultor mudar de branch ou sair do time, o gerente pode reatribuir com segurança todos os seus orçamentos ativos para outro membro para evitar furos no funil.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 font-semibold pt-2">
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-700" /> Visibilidade de Vendedores</p>
                  <p className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-700" /> Reatribuição Segura de Leads</p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-700" /> Controle de Acessos Recentes</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-700" /> Aprovação de Descontos</p>
                </div>
              </div>
              <div className="md:col-span-5 bg-gradient-to-br from-[#effaf4] to-[#f4fcf7] p-6 rounded-xl border border-emerald-200/60 flex flex-col justify-center text-center">
                <Store className="w-16 h-16 text-emerald-600/70 mx-auto stroke-[1.2] mb-3" />
                <p className="text-xs font-bold text-emerald-800">Visualização de Loja Isolada</p>
                <p className="text-[10px] text-stone-500 mt-1 max-w-xs mx-auto">O gerente cuida exclusivamente de sua filial sem vazar informações cruciais de outras praças.</p>
              </div>
            </div>
          )}

          {activeSegment === 'supervisor' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="md:col-span-7 space-y-4">
                <span className="p-1 px-2 text-[9px] font-bold text-stone-800 bg-stone-200 rounded uppercase tracking-wider">
                  Nível de Acesso 3 - Diretor Executivo (Supervisor Master)
                </span>
                <h3 className="text-2xl font-black text-stone-800 leading-tight">
                  Controle Centralizado, Métricas SaaS e Segurança Máxima.
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Dá o controle total da operação. Controle de comissões, faturamento acumulado, cadastro de novas lojas físicas, e logs de auditoria detalhados de quem se autenticou no sistema.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 font-semibold pt-2">
                  <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-stone-700" /> Auditoria de IPs e Atividades</p>
                  <p className="flex items-center gap-2"><Store className="w-4 h-4 text-stone-700" /> Cadastro Ilimitado de Lojas</p>
                  <p className="flex items-center gap-2"><Monitor className="w-4 h-4 text-stone-700" /> Configurações Gerais do Tenant</p>
                  <p className="flex items-center gap-2"><Lock className="w-4 h-4 text-stone-700" /> Isolamento via Security Rules</p>
                </div>
              </div>
              <div className="md:col-span-5 bg-gradient-to-br from-stone-800 to-stone-900 p-6 rounded-xl text-stone-100 flex flex-col justify-center text-center shadow-lg">
                <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto stroke-[1.2] mb-3" />
                <p className="text-xs font-bold text-white">Console Multi-Lojas Integrado</p>
                <p className="text-[10px] text-stone-300 mt-1 max-w-xs mx-auto">Acesso irrestrito focado no gerenciamento estratégico corporativo do ecossistema.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cloud Security & Enterprise Reliability */}
      <section id="seguranca" className="bg-[#1b1917] text-stone-100 py-16 px-4 sm:px-8 relative overflow-hidden">
        
        {/* Subtle decorative lights */}
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
              Empresa Homologada Sono Show Móveis
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white leading-tight">
              Infraestrutura SaaS com Segurança de Nível Bancário.
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
              O ecossistema corporativo armazena os dados em nuvem sob rígidas regras de controle preventivo no Google Cloud Platform. As conexões são criptografadas e protegidas via chaves seguras que isolam o faturamento de cada loja física.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Banco Firestore Sincronizado:</strong> Armazenamento sem perda local. Se o celular do consultor descarregar ou cair a internet, o banco recupera o estado atualizado.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Controle de IPs de Acesso:</strong> O painel audita logins fornecendo histórico do IP e localização estimados contra furos de segurança.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  <strong>Sessões Auto-Reconhecidas:</strong> Sistema de auto-healing capaz de unificar contas duplicadas e migrar orçamentos orfanados sem perdas.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <Lock className="w-8 h-8 text-amber-500 stroke-[1.5]" />
              <p className="text-sm font-bold text-white">Regras de Segurança</p>
              <p className="text-xs text-stone-400">Restrição granular no Firestore impedindo que consultores modifiquem relatórios ou alterem dados de outros vendedores.</p>
            </div>

            <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-500 stroke-[1.5]" />
              <p className="text-sm font-bold text-white">Auditoria Transparente</p>
              <p className="text-xs text-stone-400">Todas as criações de lojas e registros de cargos geram uma entrada invisível de log de auditoria permanente na nuvem.</p>
            </div>

            <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <Smartphone className="w-8 h-8 text-amber-500 stroke-[1.5]" />
              <p className="text-sm font-bold text-white">Disponibilidade Móvel</p>
              <p className="text-xs text-stone-400">Totalmente responsivo projetado prioritariamente para telas de 6 e 6.7 polegadas, mais usadas no chão de loja pelos vendedores.</p>
            </div>

            <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <Store className="w-8 h-8 text-amber-500 stroke-[1.5]" />
              <p className="text-sm font-bold text-white">Suporte Multi-Lojas</p>
              <p className="text-xs text-stone-400">Cadastre infinitas praças para expandir seu negócio sabendo que os faturamentos permanecem devidamente agrupados e organizados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="bg-amber-50 py-16 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-stone-950 tracking-tight leading-none">
            Impulsione os resultados da sua rede de móveis hoje.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
            Pronto para ver o faturamento da sua equipe decolar e controlar as margens com inteligência real? Conecte-se agora mesmo à plataforma com um clique.
          </p>
          <div className="pt-4">
            <button
              onClick={onEnterPortal}
              id="landing-bottom-cta-btn"
              className="px-10 py-4 bg-stone-950 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            >
              Iniciar Painel de Controle 
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 text-xs py-10 px-4 sm:px-8 border-t border-stone-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-extrabold text-stone-300 uppercase tracking-widest text-sm">
              Radar<span className="text-amber-500">Conquista</span>
            </p>
            <p className="text-[10px] text-stone-600 font-bold mt-1 uppercase tracking-wide">
              Mecanismos Corporativos Sono Show Móveis S/A
            </p>
          </div>
          <p className="text-[10px] text-stone-600">
            &copy; {new Date().getFullYear()} RadarConquista. Desenvolvido para alta performance em varejo de planejados de alto padrão.
          </p>
        </div>
      </footer>

    </div>
  );
};
