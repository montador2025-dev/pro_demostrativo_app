import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  User, 
  Mail, 
  Building2, 
  Smartphone, 
  Lock, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'sonner';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'individual' | 'store' | 'network';
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'store'
}) => {
  const { setCurrentUser, addAuditLog } = useAppContext();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'store' | 'network'>(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  
  // Registration Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
  });

  // Credit Card Form
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  if (!isOpen) return null;

  const plans = {
    individual: {
      id: 'individual',
      name: 'Plano Consultor Avulso',
      price: 49.00,
      period: 'mês',
      maxUsers: 2,
      subtitle: 'Para consultores de design e móveis independentes',
      features: [
        'Acesso mobile total ao app',
        'Histórico pessoal de clientes',
        'Geração de propostas em PDF ilimitadas',
        'Compartilhamento de links via WhatsApp',
        'Backups seguros na nuvem'
      ]
    },
    store: {
      id: 'store',
      name: 'Plano Loja Única',
      price: 149.00,
      period: 'mês',
      maxUsers: 15,
      subtitle: 'Ideal para lojas de móveis físicas independentes',
      features: [
        'Até 15 consultores/vendedores ativos',
        'Painel de Gestão para 1 Supervisor',
        'Reatribuição de clientes sem perda',
        'Configurações de taxas personalizadas',
        'Auditoria e acompanhamento de metas',
        'Logs de segurança e compliance'
      ]
    },
    network: {
      id: 'network',
      name: 'Plano Redes & Corporativo',
      price: 389.00,
      period: 'mês',
      maxUsers: 250,
      subtitle: 'Controle absoluto para grupos de lojas e franquias',
      features: [
        'Filiais ilimitadas (Suporte multi-lojas)',
        'Suporte a múltiplos Gerentes e Diretores',
        'Auditoria avançada de segurança (IPs)',
        'Métricas gerais de performance da rede',
        'Suporte prioritário VIP 24/7',
        'Criação de políticas de comissão centralizadas'
      ]
    }
  };

  const selectedPlanDetails = plans[selectedPlan];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Masking formatting for CC details
    let formattedValue = value;
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').substring(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Validate Step 2 details before moving to checkout payment
  const validateStep2 = () => {
    const { name, email, password, companyName, phone } = formData;
    if (!name.trim()) {
      toast.error('Informe o nome do Supervisor!');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Informe um e-mail corporativo válido!');
      return false;
    }
    if (!password || password.length < 6) {
      toast.error('A senha de acesso deve possuir pelo menos 6 caracteres!');
      return false;
    }
    if (!companyName.trim()) {
      toast.error('Qual o nome da sua empresa/loja?');
      return false;
    }
    if (!phone.trim()) {
      toast.error('Informe um WhatsApp para notificações do plano!');
      return false;
    }
    return true;
  };

  const activateSubscriptionSequence = async () => {
    // Basic CC check if payment method is card
    if (paymentMethod === 'card') {
      const { number, name, expiry, cvv } = cardData;
      if (number.length < 15 || !name.trim() || expiry.length < 5 || cvv.length < 3) {
        toast.error('Preencha os dados do cartão de crédito corretamente!');
        return;
      }
    }

    setIsProcessing(true);
    
    const steps = [
      'Comunicando com gateway de pagamento seguro...',
      'Processando cobrança junto à operadora bancária...',
      'Pagamento aprovado! Integrando credenciais no Firebase Auth...',
      'Sincronizando regras de segurança e salvando dados do Supervisor...',
      'Estruturando painel da sua empresa...'
    ];

    try {
      // Step 1: Simulate Payment Webhook Processing API Delay
      for (let i = 0; i < steps.length; i++) {
        setProcessingStatus(steps[i]);
        await new Promise(resolve => setTimeout(resolve, i === 2 ? 1400 : 900));
      }

      // Step 2: Register user in real Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      );
      
      const uid = userCredential.user.uid;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.length === 11 
        ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}` 
        : formData.phone;

      // Create new supervisor document in Firestore
      const newSupervisorUser = {
        id: uid,
        name: formData.name,
        role: 'supervisor' as const,
        phone: formattedPhone,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', uid), newSupervisorUser);
      } catch (userErr: any) {
        console.warn("Direct Firebase write to 'users' failed during checkout, falling back locally:", userErr);
        try {
          const currentLocalUsers = JSON.parse(localStorage.getItem('fallback_users') || '[]');
          localStorage.setItem('fallback_users', JSON.stringify([...currentLocalUsers.filter((u: any) => u.id !== uid), newSupervisorUser]));
        } catch (e) {
          console.error("Local storage backup failed for users:", e);
        }
      }

      // Create or Update Company in Firestore
      const newCompanyDetails = {
        id: 'c1',
        name: formData.companyName,
        plan: `${selectedPlanDetails.name} • Ativo`,
        maxUsers: selectedPlanDetails.maxUsers,
        licenseExpires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 1 year expiration
      };

      try {
        await setDoc(doc(db, 'companies', 'c1'), newCompanyDetails);
      } catch (companyErr: any) {
        console.warn("Direct Firebase write to 'companies' failed during checkout, falling back locally:", companyErr);
        try {
          localStorage.setItem('fallback_company', JSON.stringify(newCompanyDetails));
        } catch (e) {
          console.error("Local storage backup failed for company:", e);
        }
      }

      // Toast Success
      toast.success('Assinatura ativada com sucesso! Bem-vindo ao RadarConquista!');
      
      // Post transaction Audit log
      try {
        addAuditLog(`Assinatura de plano e cadastro de Supervisor: ${formData.companyName} (${selectedPlanDetails.name})`, 'SUCCESS');
      } catch (auditErr) {
        console.warn("Failed to write checkout audit log:", auditErr);
      }
      
      // Auto-set current state
      setCurrentUser(newSupervisorUser);
      
      // Force exit and celebration redirect
      setActiveStep(4);
      setIsProcessing(false);
      
      setTimeout(() => {
        onClose();
      }, 3500);

    } catch (err: any) {
      console.error('Checkout creation error:', err);
      setIsProcessing(false);
      
      let errorMsg = 'Não foi possível completar o cadastro.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Este e-mail já está associado a uma conta existente no ecossistema.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'O formato de e-mail informado é inválido.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'A senha de acesso informada é considerada fraca pela segurança.';
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#faf9f5] border border-stone-200 rounded-2xl shadow-2xl relative z-110 overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider font-sans">
                Assinar Plano RadarConquista
              </h3>
              <p className="text-[10px] text-stone-300 font-medium">SaaS de Alta Conversão de Vendas de Planejados</p>
            </div>
          </div>
          
          {!isProcessing && activeStep !== 4 && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Wizard Progress Line */}
        {activeStep < 4 && (
          <div className="bg-stone-100 px-6 py-3 flex items-center justify-between border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 1 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-500'}`}>1</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 hidden sm:inline">Definir Plano</span>
            </div>
            <div className="h-[2px] bg-stone-200 flex-1 mx-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 2 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-500'}`}>2</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 hidden sm:inline">Criar Supervisor</span>
            </div>
            <div className="h-[2px] bg-stone-200 flex-1 mx-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 3 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-500'}`}>3</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 hidden sm:inline">Checkout de Ativação</span>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          
          {/* STEP 1: Plan Selector */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1.5">
                <h4 className="text-lg font-black text-stone-900 font-sans">Selecione o plano ideal para sua operação:</h4>
                <p className="text-stone-500 text-xs">Você poderá alterar ou cancelar sua assinatura a qualquer momento com facilidade.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(plans).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[160px] cursor-pointer ${
                      selectedPlan === plan.id 
                        ? 'border-amber-700 bg-amber-50/20 ring-2 ring-amber-700' 
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    {plan.id === 'store' && (
                      <span className="absolute -top-2.5 right-3 bg-amber-700 text-white font-black uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        Mais Vendido
                      </span>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-xs font-extrabold text-stone-800 uppercase tracking-tight">{plan.name}</p>
                      <p className="text-[10px] text-stone-400 font-medium leading-none">{plan.subtitle}</p>
                    </div>
                    <div className="pt-4 mt-auto">
                      <span className="text-2xl font-black text-stone-900 font-mono">
                        R$ {plan.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider ml-1">/{plan.period}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Plan Benefits Summary list */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-3">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Benefícios Inclusos no {selectedPlanDetails.name}:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                  {selectedPlanDetails.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-700 transition-all cursor-pointer border-none shadow-md"
                >
                  Continuar para Cadastro de Conta
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Sign Up Details */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-stone-900">Configure seu Acesso de Supervisor</h4>
                <p className="text-stone-500 text-xs">Crie suas credenciais administrativas corporativas para ativar o portal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-11px font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" /> Nome Completo (Supervisor Master)
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: José de Souza"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-semibold outline-none transition-all focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-11px font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" /> E-mail Corporativo (Acesso Principal)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Ex: contato@suamarca.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-semibold outline-none transition-all focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-11px font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-stone-400" /> Crie sua Senha com Criptografia
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="No mínimo 6 dígitos"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-semibold outline-none transition-all focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-11px font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" /> Nome da Empresa (Sua Marca / Rede)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Ex: Souza Planejados"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-semibold outline-none transition-all focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-11px font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-stone-400" /> Telefone / WhatsApp Corporativo
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Ex: (21) 98765-4321"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 focus:bg-white text-stone-900 text-sm font-semibold outline-none transition-all focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-5 py-2.5 border border-stone-200 text-stone-600 hover:text-stone-900 font-bold rounded-xl text-xs uppercase cursor-pointer bg-white transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    if (validateStep2()) setActiveStep(3);
                  }}
                  className="px-6 py-3 bg-stone-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-700 transition-all cursor-pointer border-none shadow-md"
                >
                  Seguir para Pagamento
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Simulated Payment Gateway / API Integration */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in relative z-10">
              {isProcessing ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 border-4 border-amber-700/20 border-t-amber-700 rounded-full animate-spin"></div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-sm font-bold text-stone-800 uppercase tracking-wider">Processando Ativação Instantânea...</p>
                    <p className="text-xs text-stone-500 font-mono max-w-sm mx-auto">{processingStatus}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-black text-stone-900">Assinatura de Ativação Instantânea</h4>
                    <p className="text-stone-500 text-xs">Simulador e API de Checkout Integrados de Alta Performance.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Method Toggle Selector */}
                    <div className="md:col-span-4 flex flex-col gap-2.5">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Método de Ativação:</p>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          paymentMethod === 'pix'
                            ? 'border-amber-700 bg-amber-50/20 ring-1 ring-amber-700'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
                        <div className="text-left leading-none">
                          <p className={`text-xs font-black ${paymentMethod === 'pix' ? 'text-amber-900' : 'text-stone-700'}`}>Ativar via PIX</p>
                          <p className="text-[9px] text-stone-400 font-medium mt-1">Aprovação em 2 segundos</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-amber-700 bg-amber-50/20 ring-1 ring-amber-700'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-700 shrink-0" />
                        <div className="text-left leading-none">
                          <p className={`text-xs font-black ${paymentMethod === 'card' ? 'text-amber-900' : 'text-stone-700'}`}>Cartão de Crédito</p>
                          <p className="text-[9px] text-stone-400 font-medium mt-1">Criptografado e Seguro</p>
                        </div>
                      </button>
                    </div>

                    {/* Method Content details */}
                    <div className="md:col-span-8 bg-white rounded-xl border border-stone-200/85 p-5 min-h-[180px]">
                      {paymentMethod === 'pix' && (
                        <div className="space-y-4 animate-fade-in text-center sm:text-left">
                          <p className="text-xs font-bold text-stone-700 uppercase tracking-normal">🔒 Cobrança Gerada na Rede Segura RadarConquista:</p>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                            <div className="bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-center shrink-0">
                              <QrCode className="w-24 h-24 text-stone-800" />
                            </div>
                            <div className="space-y-1 leading-none text-center sm:text-left">
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">PIX Copia e Cola Seguro:</p>
                              <code className="text-[9px] font-mono text-stone-600 block bg-stone-100 p-1.5 rounded border border-stone-200/80 max-w-xs break-all truncate">
                                00020126440014BR.GOV.BCB.PIX2525api.radarconquista.com.br/checkout/active/c1
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('00020126440014BR.GOV.BCB.PIX2525api.radarconquista.com.br/checkout/active/c1');
                                  toast.success('Chave PIX Copia e Cola copiada para a área de transferência!');
                                }}
                                className="px-2.5 py-1 text-[9px] font-sans font-extrabold uppercase bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-all mt-1 cursor-pointer inline-block"
                              >
                                Copiar Chave PIX
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-500 leading-relaxed font-semibold flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Pague e Ative:</strong> O simulador de PIX está live. Ao clicar no botão abaixo, a API confirmará o Pix instantaneamente e ativará suas chaves de acesso.</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="space-y-3.5 animate-fade-in font-sans">
                          <p className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Transação Criptografada SSL End-to-End:</p>
                          
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="col-span-2 space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">Número do Cartão</label>
                              <input
                                type="text"
                                name="number"
                                placeholder="4000 1234 5678 9010"
                                value={cardData.number}
                                onChange={handleCardChange}
                                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-xs font-mono outline-none focus:border-amber-700"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">Validade (MM/AA)</label>
                              <input
                                type="text"
                                name="expiry"
                                placeholder="12/30"
                                value={cardData.expiry}
                                onChange={handleCardChange}
                                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-xs font-mono outline-none focus:border-amber-700"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">CVV / Código</label>
                              <input
                                type="text"
                                name="cvv"
                                placeholder="123"
                                value={cardData.cvv}
                                onChange={handleCardChange}
                                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-xs font-mono outline-none focus:border-amber-700"
                              />
                            </div>

                            <div className="col-span-2 space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">Nome Impresso no Cartão</label>
                              <input
                                type="text"
                                name="name"
                                placeholder="JOSE SOUZA"
                                value={cardData.name}
                                onChange={handleCardChange}
                                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-xs outline-none focus:border-amber-700 uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary order line */}
                  <div className="bg-amber-100/50 border border-amber-200 p-4 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-amber-900 uppercase">Resumo da Assinatura:</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{selectedPlanDetails.name} • 1 Ano de Licença Ininterrupta</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-amber-950 font-mono">R$ {selectedPlanDetails.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-[10px] text-stone-400 font-bold font-sans">/mês</span></p>
                      <p className="text-[9px] text-stone-400 uppercase tracking-wider font-bold">Cobrança Mensal</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-5 py-2.5 border border-stone-200 text-stone-600 hover:text-stone-900 font-bold rounded-xl text-xs uppercase cursor-pointer bg-white transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={activateSubscriptionSequence}
                      className="px-8 py-3.5 bg-amber-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-800 transition-all cursor-pointer border-none shadow-lg shadow-amber-800/15"
                    >
                      Pagar & Ativar Plano Oficial
                      <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Celebration success screen */}
          {activeStep === 4 && (
            <div className="py-12 text-center space-y-6 animate-fade-in relative z-10">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-md">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-stone-900 font-sans tracking-tight">
                  Parabéns, {formData.name}! 🎉
                </h4>
                <p className="text-sm text-stone-600 font-medium max-w-md mx-auto leading-relaxed">
                  Sua empresa <strong className="text-amber-800">{formData.companyName}</strong> está oficialmente licenciada no ecossistema <strong className="text-stone-900">RadarConquista</strong>!
                </p>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 max-w-sm mx-auto text-xs text-stone-500 font-medium">
                  Ativamos seu plano <strong className="text-stone-700">{selectedPlanDetails.name}</strong>. Você está sendo logado e direcionado ao seu novo Painel Administrativo.
                </div>
              </div>

              <div className="pt-2 animate-pulse text-[10px] text-emerald-600 uppercase tracking-widest font-black leading-none">
                Redirecionando ao painel corporativo seguro...
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
