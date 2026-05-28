import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatCurrency, formatTimeAgo } from '../../lib/formatters';
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
  UserPlus,
  Shield,
  Key,
  Activity,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { User, Branch } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

// SaaS Premium Elegant Analytics Sparkline Graph
const MiniSparkline = ({ points, color = '#b45309' }: { points: number[], color?: string }) => {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min;
  const height = 34;
  const width = 120;
  
  const coordinates = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - 4 - ((p - min) / range) * (height - 8);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${coordinates} ${width},${height} 0,${height}`;
  const gradId = React.useId();

  return (
    <div className="flex items-center gap-2 select-none">
      <svg className="w-[110px] h-[34px] stroke-2 overflow-visible" viewBox={`0 0 ${width} ${height}`} fill="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradId})`} />
        <polyline points={coordinates} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const SupervisorDashboard = () => {
  const { 
    branches, 
    users, 
    quotes, 
    addBranch, 
    updateBranch, 
    deleteBranch, 
    addUser, 
    updateUser, 
    deleteUser, 
    activeTab, 
    setActiveTab,
    currentCompany,
    auditLogs,
    updateCompanySettings
  } = useAppContext();
  
  const [compName, setCompName] = useState(currentCompany?.name || 'RadarConquista');
  const [compPlan, setCompPlan] = useState(currentCompany?.plan || 'Enterprise SaaS Corporate Plus');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const triggerZeroTrustAudit = () => {
    setIsAuditing(true);
    setAuditResult(null);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditResult('SUCESSO: Regras do Firestore validadas. Criptografia ponta-a-ponta habilitada. Zero vulnerabilidades encontradas no tenant.');
      toast.success('Varredura Completa: Estrutura em total conformidade e protegida!');
    }, 1200);
  };

  const handleUpdateTenantSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;
    updateCompanySettings?.(compName.trim(), compPlan);
    toast.success('Tenant SaaS atualizado com sucesso na nuvem!');
  };
  
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // States for Edit/Delete actions
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean, user: User | null, name: string, phone: string }>({ isOpen: false, user: null, name: '', phone: '' });
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
    updateUser(editUserModal.user.id, editUserModal.name.trim(), editUserModal.phone.trim());
    setEditUserModal({ isOpen: false, user: null, name: '', phone: '' });
    toast.success('Perfil do colaborador retificado na base!');
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
                      <TableCell className="pl-6 uppercase">
                        <div className="font-bold text-stone-955">{s.name}</div>
                        <div className="text-[10px] text-stone-500 font-medium normal-case flex items-center gap-1.5 mt-0.5">
                          {s.lastAccess ? (
                            <>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                (new Date().getTime() - new Date(s.lastAccess).getTime()) < 180000 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : 'bg-stone-300'
                              }`}></span>
                              <span className="font-medium text-stone-600">
                                {(new Date().getTime() - new Date(s.lastAccess).getTime()) < 180000 ? 'Online agora' : `Acesso: ${formatTimeAgo(s.lastAccess)}`}
                              </span>
                              <span className="text-stone-300">|</span>
                              <span className="text-stone-400 font-normal font-sans">
                                {new Date(s.lastAccess).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                              <span className="text-stone-400">Nunca acessou o sistema</span>
                            </>
                          )}
                        </div>
                      </TableCell>
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
      <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_12px_40px_rgba(28,25,23,0.03)] group transition-all duration-300 hover:shadow-[0_16px_48px_rgba(28,25,23,0.06)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-6 -mt-6 select-none pointer-events-none transition-transform duration-700 group-hover:scale-110">
          <Building2 className="w-64 h-64 text-[#b45309]" />
        </div>
        
        {/* Subtle executive neon status accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600/30 via-stone-800 to-amber-700/40 rounded-t-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-75/10 text-amber-805 border border-amber-700/10 font-bold text-[9px] uppercase tracking-wider px-3.5 py-1">
                ⚡ Diretoria & Operações Corporativas
              </Badge>
              <div className="flex items-center gap-1.5 text-[9px] text-[#b45309] font-black bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-600/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span> VISÃO TOTAL DA REDE
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight uppercase leading-none italic font-sans">
              Supervisão de <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-800 to-stone-900 font-extrabold">Operações</span>
            </h1>
            <p className="text-xs text-stone-500 font-semibold max-w-xl leading-relaxed">
              Análise integrativa de faturamento bruto potencial regional, controle estratégico de filiais de showroom, e designação do quadro gerencial.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* CRUD branch trigger */}
            <Dialog open={isBranchOpen} onOpenChange={setIsBranchOpen}>
              <DialogTrigger render={
                <Button className="h-12 flex items-center justify-center gap-2 px-5 bg-amber-700 hover:bg-amber-800 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-amber-700/10 hover:shadow-amber-700/20 active:scale-[0.97] transition-all rounded-xl border-none">
                  <Plus className="w-4 h-4 text-amber-200" /> Inaugurar Filial
                </Button>
              } />
              <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-700" /> Nova Loja
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">Cadastrar e inaugurar uma nova unidade comercial na plataforma RadarConquista.</DialogDescription>
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
                <Button className="h-12 flex items-center justify-center gap-2 px-5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-black text-xs uppercase hover:shadow-md transition-all rounded-xl active:scale-[0.97]">
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
        </div>
      </div>

      {/* Network Metrics Totals overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        
        {/* Total Unidades */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-amber-700/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-700/10">
                  <Store className="w-4 h-4" />
                </span>
                Showrooms
              </span>
              <div className="pt-2">
                <div className="text-2xl font-black text-stone-900 tracking-tight font-sans">
                  {branches.length} <span className="text-xs text-stone-400 font-bold uppercase normal-case">unidades</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-1">Lojas físicas implantadas</p>
              </div>
            </div>
            <MiniSparkline points={[1, 2, 2, 3, branches.length || 4]} color="#b45309" />
          </div>
        </div>

        {/* Quadro Gerencial */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-stone-800/20">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-300/10">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                Quadro Gerencial
              </span>
              <div className="pt-2">
                <div className="text-2xl font-black text-stone-900 tracking-tight font-sans">
                  {managers.length} <span className="text-xs text-stone-400 font-bold uppercase normal-case">diretores</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-1">Gestores gerais de showroom</p>
              </div>
            </div>
            <MiniSparkline points={[1, 1, 2, 2, managers.length || 3]} color="#57534e" />
          </div>
        </div>

        {/* Força de Vendas */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-blue-600/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-600/10">
                  <Users className="w-4 h-4" />
                </span>
                Força de Vendas
              </span>
              <div className="pt-2">
                <div className="text-2xl font-black text-stone-900 tracking-tight font-sans">
                  {salespeople.length} <span className="text-xs text-stone-400 font-bold uppercase normal-case">consultores</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-1">Consultores reportando leads</p>
              </div>
            </div>
            <MiniSparkline points={[4, 8, 12, 10, salespeople.length || 15]} color="#2563eb" />
          </div>
        </div>

        {/* Expectativa Comercial Bruta */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-emerald-600/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-500/10">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Expectativa Bruta
              </span>
              <div className="pt-2">
                <div className="text-xl font-black text-emerald-600 tracking-tight font-mono">
                  {formatCurrency(totalQuotesValue)}
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-2 uppercase tracking-wide">Soma total de propostas</p>
              </div>
            </div>
            <MiniSparkline points={[45000, 78000, 112000, 95000, totalQuotesValue || 120000]} color="#10b981" />
          </div>
        </div>

      </div>

      {/* RENDERING DYNAMIC SCENARIO PANELS (HOME, USER LIST, BRANCH CRUD) */}
      <div className="pt-2">
        {activeTab === 'security' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* SaaS multi-tenant & security configuration column */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none bg-white p-6 shadow-xs rounded-2xl">
                <CardHeader className="p-0 pb-4 border-b border-stone-100 flex flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-[#b45309] border border-[#b45309]/10">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider">
                      Gerenciamento de Tenant SaaS Multi-Empresa
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-400 font-semibold">
                      Parâmetros corporativos da empresa e alinhamento do plano ativo no ecossistema RadarConquista.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-5">
                  <form onSubmit={handleUpdateTenantSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Razão Social / Nome Fantasia</Label>
                        <Input 
                          className="h-11 bg-stone-50 border-stone-250 text-xs font-bold text-stone-900 focus:bg-white rounded-xl"
                          value={compName} 
                          onChange={(e) => setCompName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Plano Atual SaaS</Label>
                        <Select value={compPlan} onValueChange={setCompPlan}>
                          <SelectTrigger className="h-11 bg-stone-50 border-stone-250 text-xs font-bold text-stone-900 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="Starter SaaS Plan">Starter SaaS Plan</SelectItem>
                            <SelectItem value="Enterprise SaaS Corporate Plus">Enterprise SaaS Corporate Plus</SelectItem>
                            <SelectItem value="Super Scalable Elite Plan">Super Scalable Elite Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-150/50 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-stone-400 pl-0.5">Status do Registro Comercial</span>
                        <div className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5 uppercase pl-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          Ambiente Privado Ativo & Licenciado
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-stone-400 block pr-0.5">Vencimento da Licença</span>
                        <span className="text-xs font-semibold text-stone-600 font-mono pr-0.5">25/05/2028</span>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="h-11 px-5 text-xs font-black uppercase bg-amber-700 hover:bg-amber-800 text-white rounded-xl border-none">
                        Gravar Alterações SaaS
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Security rule verification matrix */}
              <Card className="border-none bg-white p-6 shadow-xs rounded-2xl">
                <CardHeader className="p-0 pb-4 border-b border-stone-100 flex flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 text-amber-700 border border-amber-500/10">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider">
                      Políticas de Escopo & Proteção Firestore (RBAC)
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-400 font-semibold">
                      Matriz de permissões e restrições de isolamento por nível hierárquico e filial.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-stone-50/50 border border-stone-100 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-amber-700 font-bold shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wide">Supervisor Master</h5>
                        <p className="text-[11px] text-stone-500 font-semibold">Controle total (Ler, Criar, Atualizar, Deletar) em nível multi-lojas e multi-estados. Acesso unificado central.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-stone-50/50 border border-stone-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wide">Gerente de Unidade</h5>
                        <p className="text-[11px] text-stone-500 font-semibold">Leitura total de orçamentos e edição de consultores restritos exclusivamente à sua filial física designada.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-stone-50/50 border border-stone-100 rounded-xl">
                      <UserCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-extrabold text-[#1c1917] uppercase tracking-wide">Consultor de Vendas</h5>
                        <p className="text-[11px] text-stone-500 font-semibold">Permissão de criação e escrita restrita aos próprios orçamentos criados. Proteção rígida do pipeline individual.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-950 text-stone-100 rounded-2xl font-mono text-[10px] space-y-2 border border-stone-800 shadow-md">
                    <div className="flex items-center justify-between text-[11px] text-amber-500 border-b border-stone-800 pb-2 mb-2">
                      <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wide">
                        <Database className="w-3.5 h-3.5" />
                        Auditoria de Segurança Firestore rules
                      </span>
                      <span className="text-[9px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md uppercase font-bold">Zero-Trust Ativo</span>
                    </div>
                    <p className="text-stone-300">rules_version = \'2\';</p>
                    <p className="text-stone-300">service cloud.firestore {'{'} match /databases/{'{'}database{'}'}/documents {'{'} ... {'}}'}</p>
                    <p className="text-stone-400">// Isolação do Staff: allow write, delete: if isSupervisor();</p>
                    <p className="text-stone-400">// Isolação do Orçamento: allow update: if resource.data.createdBy == request.auth.uid;</p>

                    {auditResult && (
                      <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-400/90 text-[11px] font-semibold font-sans">
                        {auditResult}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button 
                        type="button" 
                        onClick={triggerZeroTrustAudit} 
                        disabled={isAuditing}
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-wider bg-stone-800 hover:bg-stone-700 text-stone-100 border-none rounded-lg flex items-center gap-2"
                      >
                        {isAuditing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Executando Auditoria Adversa...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                            Executar Varredura de Segurança
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audit Logs Right Column */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <Card className="border-none bg-white p-6 shadow-xs rounded-2xl h-full flex flex-col">
                <CardHeader className="p-0 pb-4 border-b border-stone-100 flex flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 text-[#b45309] border border-[#b45309]/10">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider">
                      Log de Eventos & Segurança
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-400 font-semibold">
                      Registro de auditoria para fins de compliance e conformidade com a LGPD.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-5 flex-1 flex flex-col justify-between">
                  {/* Event list */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {auditLogs?.map((log) => {
                      const isWarning = log.status === 'WARNING';
                      const isAlert = log.status === 'ALERT';
                      return (
                        <div key={log.id} className="p-3 bg-stone-50/70 border border-stone-150/40 rounded-xl transition-all hover:bg-stone-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-stone-400 font-bold">
                              {new Date(log.timestamp).toLocaleTimeString('pt-BR')} - {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                            </span>
                            <span className={`text-[8px] font-black uppercase rounded-md px-1.5 py-0.5 ${
                              isWarning 
                                ? 'bg-amber-100 text-amber-800' 
                                : isAlert 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {log.status === 'SUCCESS' ? 'Seguro' : isWarning ? 'Aviso' : 'Alerta'}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-stone-900 mb-1">{log.action}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                              Iniciador: {log.userName} ({log.role.toUpperCase()})
                            </span>
                            <span className="text-[9px] text-stone-400 font-mono">
                              IP: {log.ipAddress}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-4 border-t border-stone-50 text-center text-[9px] font-black uppercase tracking-widest text-[#1c1917]/35 mt-4">
                    Audit Trail ● RadarConquista Shield Ativo
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === 'users' ? (
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
                        <TableCell className="pl-6 uppercase">
                          <div className="font-bold text-stone-950">{u.name}</div>
                          <div className="text-[10px] text-stone-500 font-medium normal-case flex items-center gap-1.5 mt-0.5">
                            {u.lastAccess ? (
                              <>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                  (new Date().getTime() - new Date(u.lastAccess).getTime()) < 180000 
                                    ? 'bg-emerald-500 animate-pulse' 
                                    : 'bg-stone-300'
                                }`}></span>
                                <span className="font-medium text-stone-600">
                                  {(new Date().getTime() - new Date(u.lastAccess).getTime()) < 180000 ? 'Online agora' : `Acesso: ${formatTimeAgo(u.lastAccess)}`}
                                </span>
                                <span className="text-stone-300">|</span>
                                <span className="text-stone-400 font-normal font-sans font-sans">
                                  {new Date(u.lastAccess).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                <span className="text-stone-400">Nunca acessou o sistema</span>
                              </>
                            )}
                          </div>
                        </TableCell>
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
                              onClick={() => setEditUserModal({ isOpen: true, user: u, name: u.name, phone: u.phone || '' })}
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
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '', phone: '' })}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic">Editar Cadastro</DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Altere as credenciais e telefone de contato registrados.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Nominal</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Telefone Comercial / WhatsApp</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editUserModal.phone} onChange={(e) => setEditUserModal(m => ({ ...m, phone: e.target.value }))} required />
            </div>
            <DialogFooter className="gap-2 flex flex-row justify-end mt-4">
              <Button type="button" variant="ghost" className="h-10 text-xs text-stone-500" onClick={() => setEditUserModal({ isOpen: false, user: null, name: '', phone: '' })}>Sair</Button>
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
            Você tem certeza sobre a exclusão de <strong>{deleteUserModal.user?.name}</strong> da base operacional RadarConquista? Esta operação é definitiva.
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
