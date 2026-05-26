import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Logo } from '../ui/Logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
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
  Sparkles, 
  Briefcase 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser, setCurrentUser, activeTab, setActiveTab, usingLocalFallback } = useAppContext();

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
      return [
        { id: 'home', label: 'Painel Geral', icon: <Home className="w-5 h-5" /> },
        { id: 'branches', label: 'Unidades (Lojas)', icon: <Store className="w-5 h-5" /> },
        { id: 'users', label: 'Gestão de Staff', icon: <Users className="w-5 h-5" /> },
        { id: 'security', label: 'Controle & SaaS', icon: <ShieldCheck className="w-5 h-5" /> },
      ];
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
        <div className="p-6 border-b border-[#1c1917]/6 flex items-center gap-3">
          <Logo className="scale-85 origin-left" />
          <span className="font-extrabold text-xl tracking-tight uppercase italic text-stone-900">
            Atende<span className="text-[#b45309] text-glow">Pro</span>
          </span>
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
        <div className="p-4 border-t border-[#1c1917]/6 bg-stone-50/50 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200 shadow-xs">
            <Avatar className="w-10 h-10 border border-amber-700/10 shadow-sm">
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
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* SYSTEM APP HEADER */}
        <header className="bg-white/80 border-b border-[#1c1917]/6 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile-only header info */}
            <div className="md:hidden flex items-center gap-2">
              <Logo className="scale-75 origin-left" />
              <span className="font-extrabold text-lg tracking-tight uppercase italic text-stone-900">
                Atende<span className="text-[#b45309]">Pro</span>
              </span>
            </div>
            
            {/* Desktop header title info */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Showroom Sono Show Ativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-400 font-bold hidden lg:inline select-none">
              Alterar perfil para simulação:
            </span>

            <select
              value={currentUser?.id}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-[180px] md:w-[240px] h-10 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-900 shadow-xs outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
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
            
            {/* Quick avatar wrapper */}
            <Avatar className="w-9 h-9 border border-stone-200 shadow-xs md:hidden">
              <AvatarFallback className="bg-amber-700 text-white font-bold text-xs">
                {currentUser?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* SCREEN SCENE CONTENT */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 md:p-8">
          {usingLocalFallback && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Modo Sandbox Ativo (Banco de Dados Firebase Protegido)
                  </h4>
                  <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                    O Firestore está retornando erro de permissão (pois o provedor <strong>E-mail/Senha</strong> não está ativado no Firebase Console). 
                    Para que o banco permaneça online e compartilhado, siga o guia enviado no chat. Enquanto isso, o AtendePro simula tudo em tempo real de forma 100% funcional!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-amber-700/8 hover:bg-amber-700/12 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all select-none cursor-pointer border border-amber-700/10"
                >
                  Abrir Console
                </a>
              </div>
            </div>
          )}
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
      
    </div>
  );
};
