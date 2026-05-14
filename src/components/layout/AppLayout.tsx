import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  ShieldCheck, 
  Building2, 
  UserCircle2, 
  Home, 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings,
  Menu,
  X,
  Plus,
  HelpCircle,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser, setCurrentUser, quotes } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingNotifications = quotes.filter(q => {
    if (q.status !== 'pending') return false;
    // Overdue or today
    const returnDate = new Date(q.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return returnDate <= today;
  });

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setCurrentUser(user);
    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Início', active: true },
    { icon: LayoutDashboard, label: 'Kanban Board' },
    { icon: FileText, label: 'Relatórios' },
    { icon: Users, label: 'Minha Equipe' },
    { icon: TrendingUp, label: 'Financeiro' },
    { icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Flowlu Style */}
      <aside className={cn(
        "bg-[#1E293B] text-slate-400 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-[110] lg:relative absolute inset-y-0 left-0",
        isSidebarOpen ? "w-60" : "w-16",
        isMobileMenuOpen ? "translate-x-0 w-64" : "lg:translate-x-0 -translate-x-full"
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-slate-800 overflow-hidden shrink-0">
          <div className="w-8 h-8 flex-shrink-0 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
            NX
          </div>
          {(isSidebarOpen || isMobileMenuOpen) && <span className="font-black text-lg tracking-tighter text-white">NEXUS CRM</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-slate-800 hover:text-white group",
                item.active && "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", item.active ? "text-emerald-500" : "text-slate-400")} />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
           <button className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors w-full px-1 py-2">
              <HelpCircle className="w-5 h-5" />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">Ajuda</span>}
           </button>
           <button className="lg:hidden flex items-center gap-3 text-rose-400 hover:text-rose-300 transition-colors w-full px-1 py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
              {isMobileMenuOpen && <span className="text-sm font-bold">Fechar Menu</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Flowlu Style */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-40 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span className="hover:text-slate-900 cursor-pointer hidden md:inline">CRM</span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="font-bold text-slate-900 truncate max-w-[150px] md:max-w-none">Pipeline de Oportunidades</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 w-48 lg:w-64 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none text-sm focus:ring-0 w-full outline-none font-medium"
              />
            </div>

            <div className="hidden lg:flex flex-col items-end pr-5 border-r border-slate-200">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
               <span className="text-sm font-black text-slate-800 tabular-nums">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </span>
            </div>

            <div className="flex items-center gap-2 sm:border-l sm:pl-5 border-slate-200">
              <Select value={currentUser?.id} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[40px] sm:w-[180px] h-9 border-none bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors p-0 sm:px-3">
                  <div className="hidden sm:block truncate">
                    <SelectValue />
                  </div>
                  <UserCircle2 className="w-5 h-5 sm:hidden mx-auto" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2 font-medium">
                        {u.role === 'supervisor' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                        {u.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative">
                <button 
                  className="p-2 text-slate-400 hover:text-slate-900 relative transition-colors"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                   <Bell className="w-5 h-5" />
                   {pendingNotifications.length > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center animate-pulse">
                       {pendingNotifications.length}
                     </span>
                   )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                       <span className="font-black text-xs uppercase tracking-widest text-slate-400">Notificações</span>
                       <Badge variant="outline" className="text-[10px] bg-rose-50 border-rose-100 text-rose-600 font-bold">{pendingNotifications.length} Urgentes</Badge>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                       {pendingNotifications.length > 0 ? (
                         pendingNotifications.map(q => (
                           <div key={q.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                             <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                   <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-slate-800 leading-tight mb-1">
                                      Retorno pendente para <span className="text-blue-600">{q.clientName}</span>
                                   </p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-slate-400 uppercase">Atrado desde: {new Date(q.returnDate).toLocaleDateString()}</span>
                                   </div>
                                </div>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-bold text-slate-400">Tudo em dia por aqui!</p>
                         </div>
                       )}
                    </div>
                    <div className="p-3 bg-slate-50 text-center">
                       <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline" onClick={() => setIsNotificationsOpen(false)}>
                          Fechar Painel
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 cursor-pointer group">
                <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-emerald-200 transition-all">
                  <AvatarFallback className="bg-emerald-500 text-white font-black text-[10px]">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Sub Header / Local Actions */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-4 sm:gap-8 h-full whitespace-nowrap">
              <button className="h-full border-b-2 border-emerald-500 text-emerald-600 font-bold text-sm px-1">Pipeline</button>
              <button className="h-full text-slate-400 hover:text-slate-900 font-medium text-sm px-1 transition-colors">Lista</button>
              <button className="h-full text-slate-400 hover:text-slate-900 font-medium text-sm px-1 transition-colors">Relatórios</button>
           </div>
           
           <div className="flex items-center gap-2 ml-4">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-3 sm:px-4 h-9 shadow-md shadow-blue-600/20 whitespace-nowrap">
                <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Criar Contato</span>
              </Button>
           </div>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 relative bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

