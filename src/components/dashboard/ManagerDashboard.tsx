import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { formatCurrency, generateWhatsAppLink, formatPhone } from '../../lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Users, Shuffle, UserMinus, AlertCircle, TrendingUp, Search, Eye, FileText, CalendarCheck, Edit, Trash2, Send, Phone, LayoutDashboard, ListFilter, UserPlus, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { User, Quote, QuoteStatus } from '../../types';
import { toast } from 'sonner';
import { KanbanBoard } from './KanbanBoard';
import { cn } from '../../lib/utils';

export const ManagerDashboard = () => {
  const { currentUser, branches, users, quotes, addUser, updateUser, deleteUser, transferUser, reassignQuotes } = useAppContext();
  
  const [viewMode, setViewMode] = useState<'pipeline' | 'team'>('pipeline');
  const [isSalespersonOpen, setIsSalespersonOpen] = useState(false);
  const [newSalespersonName, setNewSalespersonName] = useState('');

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [userToTransfer, setUserToTransfer] = useState('');
  const [targetBranch, setTargetBranch] = useState('');

  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [userToReassign, setUserToReassign] = useState('');
  const [targetSalesperson, setTargetSalesperson] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sellerDetailsId, setSellerDetailsId] = useState<string | null>(null);

  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean, user: User | null, name: string }>({ isOpen: false, user: null, name: '' });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });

  if (!currentUser?.branchId) {
    return <div className="p-8 text-center text-muted-foreground font-bold">Gerente sem filial vinculada.</div>;
  }

  const myBranch = branches.find(b => b.id === currentUser.branchId);
  const mySalespeople = users.filter(u => u.role === 'salesperson' && u.branchId === myBranch?.id);
  const otherBranches = branches.filter(b => b.id !== myBranch?.id);
  
  const myBranchQuotes = quotes.filter(q => q.branchId === myBranch?.id && !q.isTransferred);

  const filteredSalespeople = mySalespeople.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSalesperson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalespersonName.trim()) return;
    addUser(newSalespersonName, 'salesperson', currentUser.branchId!);
    setNewSalespersonName('');
    setIsSalespersonOpen(false);
    toast.success('Vendedor cadastrado!');
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !editUserModal.name.trim()) return;
    updateUser(editUserModal.user.id, editUserModal.name);
    setEditUserModal({ isOpen: false, user: null, name: '' });
    toast.success('Alterado!');
  };

  const handleDeleteUser = () => {
    if (!deleteUserModal.user) return;
    deleteUser(deleteUserModal.user.id);
    setDeleteUserModal({ isOpen: false, user: null });
    toast.success('Removido!');
  };

  const handleWhatsAppAction = (quote: Quote) => {
    const msg = `Olá *${quote.clientName}*, aqui é o gerente da *${myBranch?.name}*. Gostaríamos de seguir com seu orçamento de *${formatCurrency(quote.value)}*.`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  const handleTransfer = () => {
    if (!userToTransfer || !targetBranch) return;
    transferUser(userToTransfer, targetBranch);
    setTransferDialogOpen(false);
    setUserToTransfer('');
    setTargetBranch('');
    toast.success('Vendedor transferido!');
  };

  const handleReassign = () => {
    if (!userToReassign || !targetSalesperson) return;
    reassignQuotes(userToReassign, targetSalesperson);
    setReassignDialogOpen(false);
    setUserToReassign('');
    setTargetSalesperson('');
    toast.success('Carteira repassada!');
  };

  const totalWonValue = myBranchQuotes.filter(q => q.status === 'won').reduce((acc, q) => acc + q.value, 0);
  const activeLeadsCount = myBranchQuotes.filter(q => q.status === 'pending').length;
  const wonCount = myBranchQuotes.filter(q => q.status === 'won').length;
  const conversionRate = myBranchQuotes.length > 0 ? Math.round((wonCount / myBranchQuotes.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Branch Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <TrendingUp className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total (Pendente)</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{formatCurrency(myBranchQuotes.filter(q => q.status === 'pending').reduce((acc, q) => acc + q.value, 0))}</div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <FileText className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vendas Ganhas</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{formatCurrency(totalWonValue)}</div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
               <Users className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time de Vendas</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{mySalespeople.length} <span className="text-xs font-bold text-slate-400">ativos</span></div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-indigo-600 text-white rounded-2xl group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
               <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black opacity-70 uppercase tracking-widest leading-none mb-1">Aproveitamento</div>
               <div className="text-lg font-black tabular-nums">{conversionRate}%</div>
            </div>
         </Card>
      </div>

      {/* Tool Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 h-10 shadow-sm w-full md:w-80 focus-within:border-emerald-500 transition-all">
             <Search className="w-4 h-4 text-slate-300 mr-2" />
             <input 
               type="text" 
               placeholder="Pesquisar por cliente..." 
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
                onClick={() => setViewMode('team')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'team' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Users className="w-5 h-5" />
              </button>
           </div>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-10 font-bold" onClick={() => setIsSalespersonOpen(true)}>
             <UserPlus className="w-4 h-4 mr-2" /> Novo Vendedor
           </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {viewMode === 'pipeline' ? (
          <div className="h-full overflow-hidden">
            <KanbanBoard 
              quotes={myBranchQuotes.filter(q => q.clientName.toLowerCase().includes(searchTerm.toLowerCase()))} 
              onWhatsAppClick={handleWhatsAppAction}
              onCardClick={(q) => toast.info(`Cliente: ${q.clientName}`)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500 overflow-y-auto pr-2 pb-10 custom-scrollbar">
             {filteredSalespeople.map(s => {
               const sQuotes = myBranchQuotes.filter(q => q.createdBy === s.id);
               const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
               return (
                 <Card key={s.id} className="overflow-hidden border-none shadow-xl rounded-[1.5rem] bg-white group hover:-translate-y-1 transition-all">
                    <div className="p-6">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                {s.name.charAt(0)}
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{s.name}</h3>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Vendedor Ativo</div>
                             </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" onClick={() => setEditUserModal({ isOpen: true, user: s, name: s.name })}>
                                <Edit className="w-4 h-4 text-slate-400" />
                             </Button>
                             <Button variant="ghost" size="icon" className="hover:text-red-500 hover:bg-red-50" onClick={() => setDeleteUserModal({ isOpen: true, user: s })}>
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Montante</div>
                             <div className="text-xl font-black text-emerald-700 tracking-tighter">{formatCurrency(sTotal)}</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contatos</div>
                             <div className="text-xl font-black text-slate-800">{sQuotes.length} <span className="text-xs font-medium text-slate-400">leads</span></div>
                          </div>
                       </div>

                       <div className="mt-8 flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                          <div className="text-xs font-bold text-slate-500">GESTÃO</div>
                          <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="h-8 font-bold text-xs" onClick={() => { setUserToTransfer(s.id); setTransferDialogOpen(true); }}>
                                Transferir
                             </Button>
                             <Button variant="ghost" size="sm" className="h-8 font-bold text-xs text-red-500" onClick={() => { setUserToReassign(s.id); setReassignDialogOpen(true); }}>
                                Trocar Carteira
                             </Button>
                          </div>
                       </div>
                    </div>
                 </Card>
               );
             })}
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={isSalespersonOpen} onOpenChange={setIsSalespersonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Vendedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSalesperson} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: Roberto..." value={newSalespersonName} onChange={e => setNewSalespersonName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600">Adicionar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-emerald-600">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteUserModal.isOpen} onOpenChange={(v) => !v && setDeleteUserModal({ isOpen: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Vendedor</DialogTitle>
            <DialogDescription>Deseja mesmo remover {deleteUserModal.user?.name}?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="destructive" onClick={handleDeleteUser}>Sim, Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Filial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Destino</Label>
              <Select value={targetBranch} onValueChange={setTargetBranch}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {otherBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTransfer} className="w-full">Transferir</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Repassar Carteira</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Responsável Pelos Leads</Label>
              <Select value={targetSalesperson} onValueChange={setTargetSalesperson}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {mySalespeople.filter(s => s.id !== userToReassign).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleReassign} variant="destructive" className="w-full">Confirmar Repasse</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
