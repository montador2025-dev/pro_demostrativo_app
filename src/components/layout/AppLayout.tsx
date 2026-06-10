import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Logo } from '../ui/Logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { auth } from '../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { SubscriptionCheckoutModal } from '../auth/SubscriptionCheckoutModal';
import { 
  ShieldCheck, 
  Building2, 
  UserCircle2, 
  Home, 
  BarChart3, 
  PlusCircle, 
  History, 
  Menu, 
  Store, 
  Users, 
  Calculator, 
  Briefcase,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser, setCurrentUser, activeTab, setActiveTab, usingLocalFallback, currentCompany } = useAppContext();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedUnlockPlan, setSelectedUnlockPlan] = useState<'trial' | 'individual' | 'store' | 'network'>('store');

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('radar_demo_mode');
      return saved !== 'false'; // default to true so newcomers have the guides, can toggle off
    } catch {
      return true;
    }
  });

  const toggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    try {
      localStorage.setItem('radar_demo_mode', String(val));
    } catch (e) {
      console.error(e);
    }
    if (val) {
      toast.success("Modo de Simulação ativado! Atalhos de testes e troca de perfil habilitados.");
    } else {
      toast.success("Modo Real / Produção ativado! Atalhos de simulação ocultados para uso formal.");
    }
  };

  const trialInfo = React.useMemo(() => {
    if (!currentCompany) return { isTrial: false, isExpired: false, daysRemaining: 0 };
    const planName = currentCompany.plan?.toLowerCase() || '';
    const isTrial = planName.includes('trial') || planName.includes('teste') || planName.includes('demonstração') || planName.includes('avaliação');
    if (!isTrial) return { isTrial: false, isExpired: false, daysRemaining: 0 };
    
    if (!currentCompany.licenseExpires) return { isTrial, isExpired: false, daysRemaining: 15 };
    const expires = new Date(currentCompany.licenseExpires);
    const now = new Date();
    const diffTime = expires.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isExpired = daysRemaining <= 0;
    return { isTrial, isExpired, daysRemaining };
  }, [currentCompany]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres para segurança.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading("Registrando nova senha pessoal de acesso...");

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success("Sua senha corporativa no banco de dados foi atualizada com sucesso!");
      } else {
        toast.success("Senha atualizada com sucesso no ambiente corporativo simulado!");
      }
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error("Failed to update password:", err);
      toast.error("Erro ao propagar alteração de senha: " + (err.message || "Por favor, faça login novamente para trocar de senha por segurança."));
    } finally {
      toast.dismiss(loadingToast);
      setIsUpdating(false);
    }
  };

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch(role) {
      case 'supervisor': return <ShieldCheck className="w-4 h-4 text-amber-700" />;
      case 'manager': return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'salesperson': return <UserCircle2 className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const myMenuItems = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'supervisor') {
      const email = auth.currentUser?.email || '';
      const isOwner = email === 'montador2025@gmail.com' || 
                      email.startsWith('montador') || 
                      email.startsWith('carlos') ||
                      currentUser.name?.toLowerCase()?.includes('carlos') ||
                      currentUser.name?.toLowerCase()?.includes('montador') ||
                      currentUser.id === 'u_master' ||
                      currentUser.id === 'u1';

      const items = [
        { id: 'home', label: 'Painel Geral', icon: <Home className="w-5 h-5" /> },
        { id: 'branches', label: 'Unidades (Lojas)', icon: <Store className="w-5 h-5" /> },
        { id: 'users', label: 'Gestão de Staff', icon: <Users className="w-5 h-5" /> },
      ];

      if (isOwner) {
        items.push({ id: 'security', label: 'Controle & SaaS', icon: <ShieldCheck className="w-5 h-5" /> });
      }
      return items;
    }
    if (currentUser.role === 'manager') {
      return [
        { id: 'home', label: 'Minha Unidade', icon: <Home className="w-5 h-5" /> },
        { id: 'team', label: 'Equipe de Vendas', icon: <Users className="w-5 h-5" /> },
      ];
    }
    // salesperson menu items
    return [
      { id: 'home', label: 'Início & Desempenho', icon: <Home className="w-5 h-5" /> },
      { id: 'new_quote', label: 'Novo Orçamento', icon: <PlusCircle className="w-5 h-5" /> },
      { id: 'followup', label: 'Meus Orçamentos', icon: <History className="w-5 h-5" /> },
      { id: 'simulator', label: 'Simulador Parcelas', icon: <Calculator className="w-5 h-5" /> },
    ];
  };

  const menuItems = myMenuItems();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1c1917] flex flex-col md:flex-row relative overflow-x-hidden font-sans pb-24 md:pb-0">
      
      {/* Background soft color blurs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b45309]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/3 rounded-full blur-[100px]"></div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-white border-r border-[#1c1917]/8 flex-shrink-0 relative z-30 hidden md:flex flex-col h-screen sticky top-0 shadow-sm">
        {/* Sidebar Header with Brand Logo */}
        <div className="p-5 border-b border-[#1c1917]/6 flex flex-col gap-1">
          <Logo showText={true} />
        </div>

        {/* Dynamic Sidebar Menu Items */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-3 mb-3 select-none">
            Navegação Principal
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-start gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all border-none bg-transparent ${
                  isActive 
                    ? 'bg-amber-700/8 text-amber-800 border-l-4 border-amber-700 font-bold shadow-sm hover:bg-amber-700/10' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 border-l-4 border-transparent'
                }`}
              >
                <div className={`${isActive ? 'text-amber-700' : 'text-stone-400'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Sidebar Footer with current role badge */}
        <div className="p-4 border-t border-[#1c1917]/6 bg-stone-50/50 flex flex-col gap-2.5">
          {/* INTERACTIVE DEMO MODE TOGGLE */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-900/10 text-[9.5px] font-bold text-stone-600 select-none">
            <span className="flex items-center gap-1.5 font-bold text-stone-800 uppercase tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Atalhos de Simulação
            </span>
            <button
              type="button"
              onClick={() => toggleDemoMode(!isDemoMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer focus:outline-none flex items-center ${
                isDemoMode ? 'bg-amber-700 justify-end' : 'bg-stone-300 justify-start'
              }`}
              title="Ative ou desative o modo de testes/simulação de usuários no sistema"
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200 shadow-xs border-none">
            <Avatar className="w-10 h-10 border border-amber-700/10 shadow-sm shadow-none">
              <AvatarFallback className="bg-amber-700 text-white font-bold text-sm">
                {currentUser?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="truncate min-w-0">
              <h4 className="text-xs font-bold text-stone-900 truncate">{currentUser?.name}</h4>
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-700/70 flex items-center gap-1">
                {getRoleIcon(currentUser?.role)}
                {currentUser?.role === 'supervisor' ? 'Supervisor' : currentUser?.role === 'manager' ? 'Gerente' : 'Consultor'}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-start gap-2.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-stone-500 hover:text-amber-800 hover:bg-amber-50/50 transition-colors border-none"
          >
            <KeyRound className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Mudar Minha Senha</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-start gap-2.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-stone-500 hover:text-red-700 hover:bg-red-50/50 transition-colors border-none -mt-1"
          >
            <LogOut className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Sair do Sistema</span>
          </Button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* TEST LOGIN SCREEN SUGGESTION BANNER */}
        {isDemoMode && (
          <div className="bg-[#b45309] border-b border-amber-800 text-white px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs gap-3 shadow-sm shrink-0 select-none">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-200 shrink-0" />
              <span className="font-sans font-semibold">
                🔑 Nova Tela de Login corporativa ativada! Gostaria de testar as credenciais ou atalhos de teste?
              </span>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="bg-white/15 hover:bg-white/25 active:bg-white/35 text-white px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-white/10 shrink-0 leading-none"
            >
              <LogOut className="w-3 h-3" />
              Sair e Testar Login
            </button>
          </div>
        )}

        {/* TRIAL DAYS REMAINING BANNER */}
        {trialInfo.isTrial && !trialInfo.isExpired && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold select-none shadow-sm relative z-35 border-b border-emerald-700 gap-2">
            <div className="flex items-center gap-2">
              <span className="animate-pulse bg-white/20 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase">TRIAL</span>
              <p>Ambiente de Teste Ativo: Restam <strong className="font-extrabold underline decoration-amber-400 decoration-2">{trialInfo.daysRemaining} dias</strong> da demonstração gratuita de 15 dias da sua empresa.</p>
            </div>
            <button
              onClick={() => {
                setSelectedUnlockPlan('store');
                setIsCheckoutOpen(true);
              }}
              className="bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 px-3.5 py-1.5 rounded-lg font-black uppercase text-[9.5px] transition-all cursor-pointer shadow-sm border-none shrink-0"
            >
              🚀 Ativar Plano Mensal Oficial
            </button>
          </div>
        )}

        {/* SYSTEM APP HEADER */}
        <header className="bg-white/80 border-b border-[#1c1917]/6 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile-only header info */}
            <div className="md:hidden flex items-center pt-1">
              <Logo showText={true} size="sm" />
            </div>
            
            {/* Desktop header title info */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                RadarConquista • {isDemoMode ? 'Ambiente de Simulação' : 'Ambiente Corporativo Real'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isDemoMode ? (
              <>
                <span className="text-xs text-stone-400 font-bold hidden lg:inline select-none">
                  Alterar perfil para simulação:
                </span>

                <select
                  value={currentUser?.id}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-[180px] md:w-[240px] h-10 rounded-xl border border-[#1c1917]/10 bg-white px-3.5 text-xs font-bold text-stone-900 shadow-xs outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '16px'
                  }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="font-bold">
                      {u.role === 'supervisor' ? '🛡️ ' : u.role === 'manager' ? '🏢 ' : '🧑‍💼 '} {u.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="flex items-center gap-2.5 px-4 h-10 rounded-xl bg-amber-500/5 border border-amber-900/10 shadow-3xs select-none">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-black text-stone-900 tracking-tight uppercase">{currentUser?.name}</span>
                  <span className="text-[8px] font-black text-amber-900 uppercase tracking-widest mt-0.5">
                    {currentUser?.role === 'supervisor' ? 'Supervisor Master' : currentUser?.role === 'manager' ? 'Gerente Geral' : 'Consultor de Vendas'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Quick avatar wrapper */}
            <Avatar className="w-9 h-9 border border-stone-200 shadow-xs md:hidden">
              <AvatarFallback className="bg-amber-700 text-white font-bold text-xs">
                {currentUser?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Header Alterar Senha Button */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setIsPasswordModalOpen(true)}
              title="Alterar minha senha corporativa (Privacidade)"
              className="text-stone-500 hover:text-amber-800 hover:bg-stone-50 border-stone-200 h-8 w-8 rounded-lg cursor-pointer flex items-center justify-center p-0 shrink-0"
            >
              <KeyRound className="w-4 h-4" />
            </Button>

            {/* Header Sair Button */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentUser(null)}
              title="Sair do sistema"
              className="text-stone-500 hover:text-red-700 hover:bg-red-50/50 border-stone-200 h-8 w-8 rounded-lg cursor-pointer flex items-center justify-center p-0 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* SCREEN SCENE CONTENT */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentUser?.id}-${activeTab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION CAP (WIRED HIGHLIGHTS!) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200 flex items-center justify-around px-2 z-50 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-bold uppercase transition-all bg-transparent border-none ${
                isActive ? 'text-amber-700 font-extrabold scale-105 hover:bg-stone-50' : 'text-stone-400 font-semibold'
              }`}
            >
              <div className={`mb-1 transition-transform ${isActive ? 'scale-110 drop-shadow-md text-amber-700' : ''}`}>
                {item.icon}
              </div>
              <span className="truncate max-w-[65px] text-[8px] tracking-tight">{item.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </nav>
      
      {/* DIALOG DE ALTERAÇÃO DE SENHA PESSOAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-700" /> Alterar Minha Senha
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Para maior segurança e privacidade, altere a senha padrão <code className="bg-stone-100 px-1 py-0.5 rounded font-mono font-bold text-amber-800">radar123</code> do seu contato.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-3 font-sans">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1 animate-none">Nova Senha Pessoal</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-1000 pr-10" 
                  placeholder="Min. 6 caracteres" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Confirmar Nova Senha</Label>
              <Input 
                type="password" 
                className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-1000" 
                placeholder="Repita a nova senha" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isUpdating}
              className="w-full h-11 text-xs uppercase font-black bg-amber-700 hover:bg-amber-800 text-white flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer border-none"
            >
              <ShieldCheck className="w-4 h-4 text-white/90" />
              {isUpdating ? "Criando..." : "Salvar Nova Senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* EXPIRED TRIAL FULL-SCREEN LOCKER */}
      {trialInfo.isTrial && trialInfo.isExpired && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-150 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center font-sans animate-fade-in">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 border border-red-200 shadow-md">
              <Lock className="w-6 h-6 stroke-[3]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">🔒 Seu Teste Grátis de 15 Dias Expirou</h3>
              <p className="text-xs text-stone-500 font-semibold max-w-md mx-auto leading-relaxed">
                Agradecemos por testar o <strong>RadarConquista</strong>. O período de 15 dias de demonstração gratuita da empresa <strong className="text-stone-800">{currentCompany?.name}</strong> chegou ao fim. Para continuar emitindo ordens e gerenciando sua equipe, assine um de nossos planos:
              </p>
            </div>

            {/* Expired Options Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <button
                type="button"
                onClick={() => {
                  setSelectedUnlockPlan('individual');
                  setIsCheckoutOpen(true);
                }}
                className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-700 hover:bg-amber-50/10 hover:ring-2 hover:ring-amber-700 transition-all text-left flex flex-col justify-between h-[155px] cursor-pointer"
              >
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight text-stone-500">Consultor</h4>
                  <p className="text-[9px] text-stone-400 font-semibold leading-tight mt-1">Para 1 vendedor avulso independente.</p>
                </div>
                <div className="pt-2">
                  <p className="text-base font-mono font-black text-stone-900 leading-none">R$ 49/mês</p>
                  <p className="text-[8.5px] text-stone-400 font-bold uppercase tracking-wider mt-1 underline">Escolher Plano</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUnlockPlan('store');
                  setIsCheckoutOpen(true);
                }}
                className="p-3.5 rounded-xl border border-amber-700 bg-amber-50/5 hover:bg-amber-50/10 ring-2 ring-amber-700 transition-all text-left flex flex-col justify-between h-[155px] relative cursor-pointer"
              >
                <span className="absolute -top-2 right-2 bg-amber-700 text-white font-black uppercase text-[7.5px] px-2 py-0.5 rounded-full shadow-sm animate-pulse">LOJAS</span>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight text-amber-900">Loja Única</h4>
                  <p className="text-[9px] text-stone-400 font-semibold leading-tight mt-1">Equipes de até 15 consultores ativos.</p>
                </div>
                <div className="pt-2">
                  <p className="text-base font-mono font-black text-amber-900 leading-none">R$ 149/mês</p>
                  <p className="text-[8.5px] text-stone-400 font-bold uppercase tracking-wider mt-1 underline">Escolher Plano</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUnlockPlan('network');
                  setIsCheckoutOpen(true);
                }}
                className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-700 hover:bg-amber-50/10 hover:ring-2 hover:ring-amber-700 transition-all text-left flex flex-col justify-between h-[155px] cursor-pointer"
              >
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight text-stone-500">Múltiplas</h4>
                  <p className="text-[9px] text-stone-400 font-semibold leading-tight mt-1">Corporativos, redes e franquias.</p>
                </div>
                <div className="pt-2">
                  <p className="text-base font-mono font-black text-stone-900 leading-none">R$ 389/mês</p>
                  <p className="text-[8.5px] text-stone-400 font-bold uppercase tracking-wider mt-1 underline">Escolher Plano</p>
                </div>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-bold rounded-xl text-xs uppercase transition-all cursor-pointer bg-white"
              >
                🚪 Voltar ao Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedUnlockPlan('store');
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
              >
                🚀 Liberar Acesso Corporativo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC UPGRADE/SIGN WIZARD */}
      <SubscriptionCheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        initialPlan={selectedUnlockPlan} 
      />
      
    </div>
  );
};
