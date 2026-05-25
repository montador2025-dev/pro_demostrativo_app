import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/formatters';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Store, 
  ShieldCheck, 
  UserCircle2, 
  Search, 
  FileText, 
  CalendarCheck, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Send, 
  Eye, 
  Plus, 
  UserPlus 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { User, Branch } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const SupervisorDashboard = () => {
  const { branches, users, quotes, addBranch, updateBranch, deleteBranch, addUser, updateUser, deleteUser, activeTab, setActiveTab } = useAppContext();
  
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // States for Edit/Delete actions
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean, user: User | null, name: string }>({ isOpen: false, user: null, name: '' });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });
  const [editBranchModal, setEditBranchModal] = useState<{ isOpen: boolean, branch: Branch | null, name: string }>({ isOpen: false, branch: null, name: '' });
  const [deleteBranchModal, setDeleteBranchModal] = useState<{ isOpen: boolean, branch: Branch | null }>({ isOpen: false, branch: null });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [branchDetailsId, setBranchDetailsId] = useState<string | null>(null);

  const managers = users.filter(u => u.role === 'manager');
  const salespeople = users.filter(u => u.role === 'salesperson');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    // Safety check: Prevent duplicate branches
    const exists = branches.some(b => b.name.toLowerCase() === newBranchName.trim().toLowerCase());
    if (exists) {
      return toast.error('Bloqueio Operacional: Uma filial com esse nome já está cadastrada na rede.');
    }

    addBranch(newBranchName.trim());
    setNewBranchName('');
    setIsBranchOpen(false);
    toast.success('Nova filial inaugurada com sucesso!');
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerName.trim() || !selectedBranch) return;
    
    // Safety check: Ensure branch doesn't already have an assigned manager
    const branchHasManager = managers.some(m => m.branchId === selectedBranch);
    if (branchHasManager) {
      return toast.error('Vaga Ocupada: Esta filial já possui um Gerente Geral designado. Remaneje-o primeiro.');
    }

    addUser(newManagerName.trim(), 'manager', selectedBranch);
    setNewManagerName('');
    setSelectedBranch('');
    setIsManagerOpen(false);
    toast.success('Novo Gerente designado com sucesso!');
  };

  // Metrics calculation
  const totalQuotesValue = quotes.reduce((acc, q) => acc + q.value, 0);
  const branchMetrics = branches.map(b => {
    const branchQuotes = quotes.filter(q => q.branchId === b.id && !q.isTransferred);
    const branchSalespeople = salespeople.filter(s => s.branchId === b.id);
    const branchManager = managers.find(m => m.branchId === b.id);
    
    return {
      ...b,
      manager: branchManager,
      salespeople: branchSalespeople,
      quotesCount: branchQuotes.length,
      totalValue: branchQuotes.reduce((acc, q) => acc + q.value, 0)
    };
  });

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !editUserModal.name.trim()) return;
    updateUser(editUserModal.user.id, editUserModal.name.trim());
    setEditUserModal({ isOpen: false, user: null, name: '' });
    toast.success('Nome do colaborador retificado na base!');
  };

  const handleDeleteUser = () => {
    if (!deleteUserModal.user) return;
    
    // Safety check: Ensure no active pending quotes are orphaned on manager deletion
    if (deleteUserModal.user.role === 'manager') {
      const activeBranchQuotes = quotes.filter(q => q.branchId === deleteUserModal.user?.branchId && q.status === 'pending');
      if (activeBranchQuotes.length > 0) {
        toast.error(`Ação bloqueada: A filial deste gerente possui ${activeBranchQuotes.length} orçamentos ativos pendentes.`);
        setDeleteUserModal({ isOpen: false, user: null });
        return;
      }
    }

    deleteUser(deleteUserModal.user.id);
    setDeleteUserModal({ isOpen: false, user: null });
    toast.success('Colaborador removido das diretrizes administrativas.');
  };

  const handleDeleteBranch = () => {
    if (!deleteBranchModal.branch) return;
    
    // Check if branch has active users (managers or salespeople)
    const activeUsers = users.filter(u => u.branchId === deleteBranchModal.branch?.id);
    if (activeUsers.length > 0) {
      toast.error('Não é possível excluir uma filial que ainda possui gerentes ou consultores associados. Remaneje-os primeiro.');
      setDeleteBranchModal({ isOpen: false, branch: null });
      return;
    }

    deleteBranch(deleteBranchModal.branch.id);
    toast.success('Filial desativada com sucesso!');
    setDeleteBranchModal({ isOpen: false, branch: null });
  };

  const handleEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBranchModal.branch || !editBranchModal.name.trim()) return;
    updateBranch(editBranchModal.branch.id, editBranchModal.name.trim());
    setEditBranchModal({ isOpen: false, branch: null, name: '' });
    toast.success('Nome da unidade alterado!');
  };

  const filteredBranches = branchMetrics.filter(bm => 
    bm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (bm.manager?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const detailedBranch = branchMetrics.find(bm => bm.id === branchDetailsId);
  const detailedBranchQuotes = detailedBranch ? quotes.filter(q => q.branchId === detailedBranch.id && !q.isTransferred) : [];

  // ==========================================
  // VIEW RENDER A: UNIT DETAILS SCENARIO
  // ==========================================
  if (branchDetailsId && detailedBranch) {
    const detailedBranchTotalCount = detailedBranchQuotes.length;
    const detailedBranchTotalValueSum = detailedBranchQuotes.reduce((acc, q) => acc + q.value, 0);

    return (
      <div className="space-y-6 pb-20">
        
        {/* Detail Header Welcome card */}
        <Card className="glass-card shadow-xs border-none bg-white">
          <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button 
                variant="ghost"
                onClick={() => setBranchDetailsId(null)}
                className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-1 hover:-translate-x-1 transition-transform flex items-center gap-1.5 bg-transparent hover:bg-transparent border-none p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Controle Geral
              </Button>
              <h2 className="text-xl md:text-2xl font-extrabold uppercase italic mt-1 text-stone-900">
                Auditoria Filial: <strong className="text-amber-800 font-black">{detailedBranch.name}</strong>
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Local metrics totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card shadow-xs border-none bg-white">
            <CardHeader className="pb-1.5">
               <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Gerente Responsável</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-stone-800">{detailedBranch.manager?.name || 'Cargo Vago'}</div>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-xs border-none bg-white">
            <CardHeader className="pb-1.5">
               <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Total Consultores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-extrabold text-stone-800">{detailedBranch.salespeople.length} Ativos</div>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-xs border-none bg-white">
            <CardHeader className="pb-1.5">
               <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Volume Bruto Propostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-black font-mono text-emerald-600">{formatCurrency(detailedBranchTotalValueSum)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed staff list table */}
        <Card className="glass-card border-none bg-white pb-3 shadow-xs">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Performance de Staff da Unidade ({detailedBranch.salespeople.length})
            </CardTitle>
            <CardDescription className="text-xs text-stone-400 font-semibold">Volume bruto e montante de orçamentos gerados por colaborador na filial.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-stone-50/50">
                <TableRow className="border-stone-100">
                  <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-6">Consultor</TableHead>
                  <TableHead className="text-center font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Oportunidades</TableHead>
                  <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-6">Potencial Bruto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedBranch.salespeople.map(s => {
                  const sQuotes = detailedBranchQuotes.filter(q => q.createdBy === s.id);
                  const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                  
                  return (
                    <TableRow key={s.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <TableCell className="font-bold text-stone-950 uppercase pl-6">{s.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-xs font-extrabold text-stone-700 bg-stone-100 rounded-md px-2 py-0.5">{sQuotes.length}</span>
                      </TableCell>
                      <TableCell className="text-right font-black font-mono text-stone-900 pr-6">{formatCurrency(sTotal)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    );
  }

  // ==========================================
  // SYSTEM GENERAL SUPERVISOR SUBVIEWS
  // ==========================================
  return (
    <div className="space-y-6 pb-20">
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-3 border-b border-stone-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-pulse"></div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest select-none">
            Área de Diretoria & Decisões Corporativas
          </span>
        </div>
        <span className="text-[10px] text-stone-400 font-bold select-none font-sans">
          Rede Registrada: <strong className="text-stone-800 font-mono">{branches.length} Filiais</strong>
        </span>
      </motion.div>

      {/* Hero Executive status Welcome Card */}
      <Card className="glass-card shadow-xs border-none overflow-hidden bg-white">
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div>
            <Badge className="bg-amber-100 text-amber-800 border-none font-black text-[9px] uppercase tracking-widest px-3.5 py-1 mb-2.5">
              Administração Geral Sono Show
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight leading-none uppercase italic">
              Supervisão de <span className="text-amber-800 font-black">Operações</span>
            </h1>
            <p className="text-xs text-stone-500 font-semibold mt-1">Visão holística de receita bruta potencial, auditoria por unidades e nomeação de gerentes gerais.</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* CRUD branch trigger */}
            <Dialog open={isBranchOpen} onOpenChange={setIsBranchOpen}>
              <DialogTrigger render={
                <Button className="h-11 flex items-center justify-center gap-2 px-5 bg-amber-700 hover:bg-amber-800 shrink-0 text-xs text-white">
                  <Plus className="w-4 h-4 text-amber-300" /> Inaugurar Filial
                </Button>
              } />
              <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-700" /> Nova Loja
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">Cadastrar e inaugurar uma nova unidade comercial na plataforma AtendePro.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBranch} className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Descrição/Identificação da Loja</Label>
                    <Input className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-1000 focus:ring-0 focus:border-amber-700/50" placeholder="Ex: Filial Niterói" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full h-11 text-xs uppercase font-black tracking-widest bg-amber-700 hover:bg-amber-800 text-white">
                    Ativar Filial
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* CRUD manager trigger */}
            <Dialog open={isManagerOpen} onOpenChange={setIsManagerOpen}>
              <DialogTrigger render={
                <Button className="h-11 flex items-center justify-center gap-2 px-5 border border-stone-200 bg-white hover:bg-stone-50 rounded-2xl text-stone-800 font-extrabold text-xs uppercase transition-all shadow-2xs active:scale-95">
                  <UserPlus className="w-4 h-4 text-amber-700" /> Nomear Gerente VIP
                </Button>
              } />
              <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700" /> Designação Administrativa
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">Vincular novo supervisor geral a uma filial de showroom da rede.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddManager} className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Completo do Gerente</Label>
                    <Input className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-1000" placeholder="Ex: Henrique Pires" value={newManagerName} onChange={e => setNewManagerName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Filial de Alocação</Label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '16px'
                      }}
                      required
                    >
                      <option value="">Escolha a unidade...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full h-11 text-xs uppercase font-black bg-amber-700 hover:bg-amber-800 text-white">
                    Designar Gerente
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Network Metrics Totals overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        <Card className="glass-card shadow-xs border-none bg-white">
          <CardHeader className="pb-1.5">
             <CardTitle className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Unidades</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-stone-900">{branches.length} Lojas</div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-none bg-white">
          <CardHeader className="pb-1.5">
             <CardTitle className="text-[10px] font-black uppercase tracking-wider text-stone-400">Quadro Gerencial</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-stone-900">{managers.length} Gestores</div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-none bg-white">
          <CardHeader className="pb-1.5">
             <CardTitle className="text-[10px] font-black uppercase tracking-wider text-stone-400">Força de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-stone-900">{salespeople.length} Consultores</div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xs border-none bg-white">
          <CardHeader className="pb-1.5">
             <CardTitle className="text-[11px] font-black uppercase tracking-wider text-amber-800">Expectativa Comercial Bruta</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-emerald-600 font-mono">{formatCurrency(totalQuotesValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* RENDERING DYNAMIC SCENARIO PANELS (HOME, USER LIST, BRANCH CRUD) */}
      <div className="pt-2">
        {activeTab === 'users' ? (
          /* SYSTEM SUPERVISORS: STAFF GESTION TABLE */
          <Card className="glass-card border-none bg-white pb-3 shadow-xs">
            <CardHeader className="pb-4 border-b border-stone-100">
               <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Listagem Geral de Colaboradores e Colaboradores ({users.length})
               </CardTitle>
               <CardDescription className="text-xs text-stone-400 font-semibold">Editar designações ou desligar perfis.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader className="bg-stone-50/50">
                  <TableRow className="border-stone-100">
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-6">Colaborador</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Cargo</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Código de Alocação</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => {
                    const mappedBranch = branches.find(b => b.id === u.branchId);
                    return (
                      <TableRow key={u.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                        <TableCell className="font-bold text-stone-950 pl-6 uppercase">{u.name}</TableCell>
                        <TableCell>
                          <Badge className={`uppercase text-[8px] font-black border-none py-1 px-2 ${
                            u.role === 'supervisor' ? 'bg-amber-100 text-amber-800' : u.role === 'manager' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {u.role === 'supervisor' ? 'Supervisor Master' : u.role === 'manager' ? 'Gerente Loja' : 'Consultor'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-stone-600 uppercase text-[11px]">{mappedBranch?.name || 'Administração Central'}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditUserModal({ isOpen: true, user: u, name: u.name })}
                              className="w-8 h-8 text-stone-400 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-all bg-transparent border-none"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {u.role !== 'supervisor' && (
                              <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteUserModal({ isOpen: true, user: u })}
                                className="w-8 h-8 text-stone-300 hover:text-rose-600 hover:bg-stone-50 flex items-center justify-center transition-all animate-none bg-transparent border-none"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        ) : (
          /* SYSTEM SUPERVISORS: MAIN HOME AUDIT BRANCH MAP LIST */
          <Card className="glass-card border-none bg-white pb-3 shadow-xs">
            <CardHeader className="pb-4 border-b border-stone-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider">
                     Mapa Operacional Regional
                  </CardTitle>
                  <CardDescription className="text-xs text-stone-500 font-semibold">Consolidado bruto de vendas por pontos de showroom e comando regional.</CardDescription>
                </div>
                <div className="relative w-full md:w-72 select-none">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <Input 
                    placeholder="Filtrar por nome..." 
                    className="bg-white h-10 pl-10 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader className="bg-stone-50/50">
                  <TableRow className="border-stone-100">
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-6">Ponto Showroom</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Responsável comando</TableHead>
                    <TableHead className="text-center font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Time Vendas</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Montante Potencial</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-6">Análises</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map(bm => (
                    <TableRow key={bm.id} className="border-stone-100 hover:bg-stone-50/50 transition-all cursor-pointer group" onClick={() => setBranchDetailsId(bm.id)}>
                      <TableCell className="pl-6 py-5">
                         <div className="font-extrabold text-stone-950 uppercase text-[13px] group-hover:text-amber-800 transition-colors">{bm.name}</div>
                      </TableCell>
                      <TableCell className="font-bold text-stone-600 uppercase text-[11px]">{bm.manager?.name || 'Comando Vago'}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-xs font-extrabold text-stone-800 bg-stone-100 rounded-lg px-2.5 py-0.5">{bm.salespeople.length}</span>
                      </TableCell>
                      <TableCell className="text-right font-black font-mono text-stone-950">{formatCurrency(bm.totalValue)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setEditBranchModal({ isOpen: true, branch: bm as any, name: bm.name })}}
                            className="w-8 h-8 text-stone-400 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-all bg-transparent border-none"
                            title="Renomear unidade"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setDeleteBranchModal({ isOpen: true, branch: bm as any })}}
                            className="w-8 h-8 text-stone-300 hover:text-rose-600 hover:bg-stone-100/10 flex items-center justify-center transition-all bg-transparent border-none"
                            title="Remover filial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <Button 
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-amber-700 hover:text-amber-800 hover:bg-amber-50 flex items-center justify-center transition-all bg-transparent border-none"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredBranches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-stone-400 font-bold border-none text-xs uppercase tracking-widest bg-white">
                        Nenhuma filial encontrada para auditoria comercial.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* dialog for editing user credentials */}
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '' })}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic">Editar Cadastro</DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Altere as credenciais nominais registradas.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Nominal</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter className="gap-2 flex flex-row justify-end mt-4">
              <Button type="button" variant="ghost" className="h-10 text-xs text-stone-500" onClick={() => setEditUserModal({ isOpen: false, user: null, name: '' })}>Sair</Button>
              <Button type="submit" className="h-10 text-xs font-black uppercase bg-amber-700 hover:bg-amber-800 text-white border-transparent">Gravar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User structural check confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteUserModal.isOpen}
        onOpenChange={(open) => !open && setDeleteUserModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteUser}
        title="Desativar Acesso"
        description={
          <>
            Você tem certeza sobre a exclusão de <strong>{deleteUserModal.user?.name}</strong> da base operacional Sono Show? Esta operação é definitiva.
          </>
        }
        confirmText="Remover Perfil"
        cancelText="Sair"
        variant="destructive"
      />

      {/* dialog for editing branch name */}
      <Dialog open={editBranchModal.isOpen} onOpenChange={(v) => !v && setEditBranchModal({ isOpen: false, branch: null, name: '' })}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic">Atualizar Unidade</DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Altere o nome oficial da unidade comercial.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1 font-sans">Nome da Filial</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editBranchModal.name} onChange={(e) => setEditBranchModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter className="gap-2 flex flex-row justify-end mt-4">
              <Button type="button" variant="ghost" className="h-10 text-xs text-stone-500" onClick={() => setEditBranchModal({ isOpen: false, branch: null, name: '' })}>Cancelar</Button>
              <Button type="submit" className="h-10 text-xs font-black uppercase bg-amber-700 hover:bg-amber-800 text-white border-transparent">Atualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Branch confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteBranchModal.isOpen}
        onOpenChange={(open) => !open && setDeleteBranchModal({ isOpen: false, branch: null })}
        onConfirm={handleDeleteBranch}
        title="Remover Unidade"
        description={
          <>
            Você tem certeza que deseja excluir a filial <strong>{deleteBranchModal.branch?.name}</strong>? Esta ação desativará permanentemente o showroom e não poderá ser desfeita.
          </>
        }
        confirmText="Excluir Filial"
        cancelText="Sair"
        variant="destructive"
      />

    </div>
  );
};
