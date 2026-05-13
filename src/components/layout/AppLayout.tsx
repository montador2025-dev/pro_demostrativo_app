import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ShieldCheck, Building2, UserCircle2 } from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser, setCurrentUser } = useAppContext();

  const handleUserChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setCurrentUser(user);
  };

  const getRoleIcon = (role?: string) => {
    switch(role) {
      case 'supervisor': return <ShieldCheck className="w-4 h-4 text-primary" />;
      case 'manager': return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'salesperson': return <UserCircle2 className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900 overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]"></div>
      </div>

      <header className="border-b border-indigo-100 bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-bold text-lg">
            A<span className="text-indigo-100">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Atende<span className="text-indigo-600">Pro</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs font-semibold uppercase tracking-wider text-indigo-500/80 mr-2 bg-indigo-50 px-2 py-1 rounded-md">
            Modo Demonstração
          </div>
          <Select value={currentUser?.id} onValueChange={handleUserChange}>
            <SelectTrigger className="w-[240px] md:w-[280px] bg-white/80 border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(u.role)}
                    <span>{u.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Avatar className="w-10 h-10 border-2 border-indigo-100 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 font-bold text-sm">
              {currentUser?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
