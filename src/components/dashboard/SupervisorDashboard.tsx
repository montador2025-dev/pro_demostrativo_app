import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatCurrency, generateWhatsAppLink } from '../../lib/formatters';
import { Building2, PlusCircle, Users, BarChart3, TrendingUp, Store, ShieldCheck, UserCircle2, Search, FileText, CalendarCheck, Edit, Trash2, LayoutDashboard, ListFilter, SlidersHorizontal, ChevronLeft, ClipboardList } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { User, Branch, Quote } from '../../types';
import { KanbanBoard } from './KanbanBoard';
import { cn } from '../../lib/utils';

export const SupervisorDashboard = () => {
  const { branches, users, quotes, addBranch, updateBranch, addUser, updateUser, deleteUser } = useAppContext();
  
  const [viewMode, setViewMode] = useState<'pipeline' | 'branches'>('pipeline');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean, user: User | null, name: string }>({ isOpen: false, user: null, name: '' });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });
  const [editBranchModal, setEditBranchModal] = useState<{ isOpen: boolean, branch: Branch | null, name: string }>({ isOpen: false, branch: null, name: '' });
  const [newBranchName, setNewBranchName] = useState('');
  
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const managers = users.filter(u => u.role === 'manager');
  const salespeople = users.filter(u => u.role === 'salesperson');

  const [searchTerm, setSearchTerm] = useState('');
  const [branchDetailsId, setBranchDetailsId] = useState<string | null>(null);
  const [filterBranchId, setFilterBranchId] = useState<string>('all');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch(newBranchName);
    setNewBranchName('');
    setIsBranchOpen(false);
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerName.trim() || !selectedBranch) return;
    addUser(newManagerName, 'manager', selectedBranch);
    setNewManagerName('');
    setSelectedBranch('');
    setIsManagerOpen(false);
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesBranch = filterBranchId === 'all' || q.branchId === filterBranchId;
    const matchesSearch = q.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch && !q.isTransferred;
  });

  const handleWhatsAppAction = (quote: Quote) => {
     const msg = `Olá *${quote.clientName}*, estou acompanhando o atendimento na nossa filial e gostaria de saber se tudo ocorreu bem no seu orçamento de *${formatCurrency(quote.value)}*.`;
     window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  // Metrics
  const totalGlobalValue = filteredQuotes.reduce((acc, q) => acc + q.value, 0);
  
  const branchMetrics = branches.map(b => {
    const branchQuotes = quotes.filter(q => q.branchId === b.id && !q.isTransferred);
    return {
      ...b,
      manager: managers.find(m => m.branchId === b.id),
      totalValue: branchQuotes.reduce((acc, q) => acc + q.value, 0),
      salespeople: salespeople.filter(s => s.branchId === b.id)
    };
  });

  const filteredBranches = branchMetrics.filter(bm => 
    bm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !editUserModal.name.trim()) return;
    updateUser(editUserModal.user.id, editUserModal.name);
    setEditUserModal({ isOpen: false, user: null, name: '' });
    toast.success('Pessoa atualizada!');
  };

  const handleEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBranchModal.branch || !editBranchModal.name.trim()) return;
    updateBranch(editBranchModal.branch.id, editBranchModal.name);
    setEditBranchModal({ isOpen: false, branch: null, name: '' });
  };

  if (branchDetailsId) {
    const b = branchMetrics.find(x => x.id === branchDetailsId);
    if (b) {
      return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 lg:p-8 animate-in fade-in duration-500">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setBranchDetailsId(null)}
          />
          <div className="relative w-full max-w-6xl h-full lg:h-auto lg:max-h-[90vh] bg-gradient-to-br from-blue-700 to-indigo-900 shadow-[0_50px_100px_-20px_rgba(30,41,59,0.5)] overflow-y-auto lg:rounded-[2.5rem] p-6 sm:p-12 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
               <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setBranchDetailsId(null)} 
                    className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white shadow-2xl backdrop-blur-md"
                  >
                     <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <div>
                     <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white leading-none">{b.name}</h2>
                     <p className="text-blue-100 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-60">Relatório Executivo em Tempo Real</p>
                  </div>
               </div>
               <div className="bg-white/10 backdrop-blur-2xl px-8 py-5 rounded-[2rem] border border-white/20 text-white text-left sm:text-right shadow-2xl w-full sm:w-auto">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Montante Gerado</div>
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(b.totalValue)}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               <div className="bg-white/5 border border-white/10 backdrop-blur-md text-white p-8 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                     <Badge className="bg-blue-500/20 text-blue-300 border-none px-3">TITULAR</Badge>
                     <UserCircle2 className="w-5 h-5 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-black truncate">{b.manager?.name || 'Vago'}</div>
                  <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1 opacity-50">Gerente Responsável</div>
               </div>
               <div className="bg-white p-8 rounded-[2rem] shadow-2xl transform hover:-translate-y-1 transition-all">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engajamento</div>
                  <div className="text-4xl font-black text-slate-900 tabular-nums">{b.salespeople.length} <span className="text-sm font-medium text-slate-400">ativos</span></div>
               </div>
               <div className="bg-white p-8 rounded-[2rem] shadow-2xl transform hover:-translate-y-1 transition-all">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saúde da Unidade</div>
                  <div className="text-4xl font-black text-emerald-500 italic tracking-tighter">100%</div>
               </div>
               <div className="bg-blue-600 border border-blue-400/30 shadow-2xl p-8 rounded-[2rem] text-white transform hover:scale-105 transition-all">
                  <div className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-2">Aproveitamento</div>
                  <div className="text-4xl font-black tabular-nums">92%</div>
               </div>
            </div>

            <Card className="bg-white border-none shadow-[0_50px_100px_-50px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                     <BarChart3 className="w-5 h-5 text-blue-600" />
                     <h3 className="text-xl font-black text-slate-900">Rank de Performance</h3>
                  </div>
                  <Button variant="outline" className="rounded-xl border-slate-200 font-black text-xs h-10 w-full sm:w-auto uppercase">Extrair Performance</Button>
               </div>
               <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-none">
                        <TableHead className="px-10 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Consultor</TableHead>
                        <TableHead className="px-10 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Volume Leads</TableHead>
                        <TableHead className="px-10 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Resultado Acumulado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {b.salespeople.map(s => {
                        const sQuotes = quotes.filter(q => q.createdBy === s.id && !q.isTransferred);
                        const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                        return (
                          <TableRow key={s.id} className="hover:bg-blue-50/50 transition-colors border-slate-100">
                            <TableCell className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                     {s.name.charAt(0)}
                                  </div>
                                  <div>
                                     <div className="font-black text-slate-800 text-base">{s.name}</div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase">Consultor Sênior</div>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="px-10 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, sQuotes.length * 10)}%` }}></div>
                                  </div>
                                  <span className="font-bold text-slate-600 text-sm">{sQuotes.length}</span>
                               </div>
                            </TableCell>
                            <TableCell className="px-10 py-6 text-right font-black text-blue-700 text-xl tracking-tight">
                               {formatCurrency(sTotal)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {b.salespeople.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-20 text-center text-slate-400 font-bold italic">
                             Aguardando contratações para esta unidade...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
               </div>
            </Card>
          </div>
        </div>
      )
    }
  }

  const totalWonValue = quotes.filter(q => q.status === 'won').reduce((acc, q) => acc + q.value, 0);
  const activeLeadsCount = quotes.filter(q => q.status === 'pending').length;
  const branchesCount = branches.length;
  const conversionRate = quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'won').length / quotes.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Global Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <Card className="p-5 border-none shadow-xl bg-white rounded-[1.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
               <TrendingUp className="w-12 h-12" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Consolidado</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(totalWonValue)}</div>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span>Performance Alta</span>
            </div>
         </Card>
         <Card className="p-5 border-none shadow-xl bg-white rounded-[1.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
               <ClipboardList className="w-12 h-12" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Leads em Negociação</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{activeLeadsCount}</div>
            <div className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-tight">Todas as unidades</div>
         </Card>
         <Card className="p-5 border-none shadow-xl bg-white rounded-[1.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
               <Store className="w-12 h-12" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Operações Ativas</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{branchesCount} <span className="text-xs font-bold text-slate-400">lojas</span></div>
            <div className="mt-4 text-emerald-500 font-bold text-xs uppercase tracking-tight flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Monitoramento 100%
            </div>
         </Card>
         <Card className="p-5 border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[1.5rem] relative overflow-hidden">
            <div className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">Taxa Conversão</div>
            <div className="text-4xl font-black tabular-nums">{conversionRate}%</div>
            <div className="mt-2 text-blue-400 font-bold text-xs uppercase tracking-tight">Média do grupo</div>
         </Card>
      </div>

      {/* Search & Filter bar - Flowlu Inspired */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <ListFilter className="w-4 h-4 absolute left-3 top-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <Select value={filterBranchId} onValueChange={setFilterBranchId}>
                <SelectTrigger className="pl-9 w-[180px] h-10 border-slate-200 bg-white rounded-lg shadow-sm font-bold text-slate-700">
                  <SelectValue placeholder="Todas Filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Lojas</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>
           
           <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 h-10 shadow-sm w-full md:w-64 focus-within:border-emerald-500 transition-all">
             <Search className="w-4 h-4 text-slate-300 mr-2" />
             <input 
               type="text" 
               placeholder="Filtrar por cliente..." 
               className="bg-transparent border-none text-sm font-medium w-full outline-none text-slate-700 placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner mr-2">
              <button 
                onClick={() => setViewMode('pipeline')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'pipeline' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('branches')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'branches' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Store className="w-5 h-5" />
              </button>
           </div>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 h-10 font-bold" onClick={() => setIsBranchOpen(true)}>
             <PlusCircle className="w-4 h-4 mr-2" /> Nova Filial
           </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {viewMode === 'pipeline' ? (
          <div className="h-full overflow-hidden">
            <KanbanBoard 
              quotes={filteredQuotes} 
              onWhatsAppClick={handleWhatsAppAction}
              onCardClick={(q) => toast.info(`Detalhes de ${q.clientName}`)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
             {filteredBranches.map(b => (
               <Card 
                 key={b.id} 
                 className="overflow-hidden border-none shadow-xl rounded-[1.5rem] group hover:-translate-y-1 transition-all cursor-pointer bg-white"
                 onClick={() => setBranchDetailsId(b.id)}
               >
                 <div className="h-3 bg-gradient-to-r from-emerald-500 to-green-400"></div>
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                          <Store className="w-6 h-6 text-emerald-600" />
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento</div>
                          <div className="text-xl font-black text-slate-800">{formatCurrency(b.totalValue)}</div>
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{b.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                       <UserCircle2 className="w-4 h-4 text-emerald-500" />
                       Gerente: {b.manager?.name || 'Não atribuído'}
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                           <div className="flex -space-x-2">
                              {b.salespeople.slice(0, 3).map((s, i) => (
                                 <div key={s.id} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white text-[10px] font-black text-slate-400 uppercase">
                                    {s.name.charAt(0)}
                                 </div>
                              ))}
                              {b.salespeople.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border-2 border-white text-[10px] font-black text-emerald-600">
                                   +{b.salespeople.length - 3}
                                </div>
                              )}
                           </div>
                       <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          {b.salespeople.length} VENDEDORES
                       </div>
                    </div>
                 </div>
               </Card>
             ))}
          </div>
        )}
      </div>

      {/* Existing Management Modals */}
      <Dialog open={isBranchOpen} onOpenChange={setIsBranchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Filial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Filial</Label>
              <Input placeholder="Ex: Unidade Centro" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-emerald-600">Criar Unidade</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

