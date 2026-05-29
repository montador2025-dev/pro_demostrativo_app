import React, { useState } from 'react';
import { useAppContext, getEmailForUser } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatCurrency, generateWhatsAppLink, formatTimeAgo } from '../../lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { 
  Users, 
  Shuffle, 
  UserMinus, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Eye, 
  FileText, 
  CalendarCheck, 
  Edit, 
  Trash2, 
  Send, 
  UserPlus, 
  Zap, 
  Home, 
  Building 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { QuoteCategory, User } from '../../types';
import { toast } from 'sonner';
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

export const ManagerDashboard = () => {
  const { currentUser, branches, users, quotes, addUser, updateUser, deleteUser, transferUser, reassignQuotes, activeTab, setActiveTab } = useAppContext();
  
  const [isSalespersonOpen, setIsSalespersonOpen] = useState(false);
  const [newSalespersonName, setNewSalespersonName] = useState('');
  const [newSalespersonPhone, setNewSalespersonPhone] = useState('');

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [userToTransfer, setUserToTransfer] = useState('');
  const [targetBranch, setTargetBranch] = useState('');

  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [userToReassign, setUserToReassign] = useState('');
  const [targetSalesperson, setTargetSalesperson] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sellerDetailsId, setSellerDetailsId] = useState<string | null>(null);

  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean, user: User | null, name: string, phone: string }>({ isOpen: false, user: null, name: '', phone: '' });
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });

  if (!currentUser?.branchId) {
    return <div className="p-8 text-center text-[#1c1917]/60 font-semibold">O gerente atual não está vinculado a uma filial ativa.</div>;
  }

  const myBranch = branches.find(b => b.id === currentUser.branchId);
  const mySalespeople = users.filter(u => u.role === 'salesperson' && u.branchId === myBranch?.id);
  const otherBranches = branches.filter(b => b.id !== myBranch?.id);
  
  // Only consider quotes created in THIS branch
  const myBranchQuotes = quotes.filter(q => q.branchId === myBranch?.id);
  const totalValue = myBranchQuotes.reduce((sum, q) => sum + q.value, 0);

  const filteredSalespeople = mySalespeople.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const detailedSeller = mySalespeople.find(s => s.id === sellerDetailsId);
  const detailedSellerQuotes = detailedSeller ? myBranchQuotes.filter(q => q.createdBy === detailedSeller.id && !q.isTransferred) : [];
  const detailedSellerTotal = detailedSellerQuotes.reduce((acc, q) => acc + q.value, 0);

  const handleAddSalesperson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalespersonName.trim()) return;
    
    // Safety check: Prevent duplicate sellers in the same branch
    const exists = mySalespeople.some(s => s.name.toLowerCase() === newSalespersonName.trim().toLowerCase());
    if (exists) {
      return toast.error('Sabor Comercial Duplicado: Já existe um consultor cadastrado com este nome exato nesta unidade.');
    }

    const name = newSalespersonName.trim();
    const phone = newSalespersonPhone.trim();
    const generatedEmail = getEmailForUser(name, phone);

    addUser(name, 'salesperson', currentUser.branchId, phone);
    setNewSalespersonName('');
    setNewSalespersonPhone('');
    setIsSalespersonOpen(false);
    
    toast.success(
      <div className="flex flex-col gap-1 text-xs">
        <p className="font-bold text-emerald-800">✅ Consultor Cadastrado com Sucesso!</p>
        <p className="text-stone-600">Acesse o sistema utilizando as credenciais:</p>
        <div className="bg-stone-50 border border-stone-200 p-2 rounded-lg font-mono text-[10px] space-y-0.5 mt-1 text-stone-800">
          <p><span className="font-bold text-stone-500">E-mail:</span> {generatedEmail}</p>
          <p><span className="font-bold text-stone-500">Senha:</span> radar123</p>
        </div>
      </div>,
      { duration: 15000 }
    );
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !editUserModal.name.trim()) return;
    updateUser(editUserModal.user.id, editUserModal.name.trim(), editUserModal.phone.trim());
    setEditUserModal({ isOpen: false, user: null, name: '', phone: '' });
    toast.success('Perfil do consultor alterado com sucesso!');
  };

  const handleDeleteUser = () => {
    if (!deleteUserModal.user) return;
    
    // Safety check: Don't hard-delete if seller has pending quotes, suggest reassigning first
    const pendingCount = myBranchQuotes.filter(q => q.createdBy === deleteUserModal.user?.id && q.status === 'pending').length;
    if (pendingCount > 0) {
      toast.error(`Bloqueio de Carteira: Este consultor possui ${pendingCount} negociações ativas pendentes. Faça o repasse da carteira primeiro.`);
      setDeleteUserModal({ isOpen: false, user: null });
      return;
    }

    deleteUser(deleteUserModal.user.id);
    setDeleteUserModal({ isOpen: false, user: null });
    toast.success('Consultor excluído permanentemente da unidade.');
  };

  const handleTransfer = () => {
    if (!userToTransfer || !targetBranch) return;
    transferUser(userToTransfer, targetBranch);
    setTransferDialogOpen(false);
    setUserToTransfer('');
    setTargetBranch('');
    toast.success('Consultor transferido administrativamente para a nova unidade!');
  };

  const handleReassign = () => {
    if (!userToReassign || !targetSalesperson) return;
    reassignQuotes(userToReassign, targetSalesperson);
    setReassignDialogOpen(false);
    setUserToReassign('');
    setTargetSalesperson('');
    toast.success('Negociações comerciais ativas repelidas com sucesso para o sucessor.');
  };

  const handleManagerMessage = (quote: any) => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const msg = 
`🎯 *RADARCONQUISTA* 🎯
_Transformando atendimento em conquista de vendas._

Olá, *${quote.clientName}*!
Aqui é o(a) gestor(a) *${currentUser.name}*, da gerência RadarConquista *${myBranch?.name}*.

Acompanho de perto os atendimentos de excelência do nosso showroom e vi sua proposta do dia ${new Date(quote.createdAt).toLocaleDateString('pt-BR')} no valor de *${formatCurrency(quote.value)}*.

Gostaria de me colocar pessoalmente à disposição para te conceder uma condição VIP especial ou facilitar sua forma de parcelamento hoje para garantirmos a entrega dos seus móveis!

Posso te ligar ou liberar um código de desconto agora?`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  const getCategoryLabel = (cat: QuoteCategory) => {
    const labels: Record<QuoteCategory, string> = {
      card_turning: 'Aguardando Virada de Cartão',
      researching: 'Só Pesquisando Preço',
      price_high: 'Achou o Preço Alto',
      needs_spouse: 'Depende de Cônjuge',
      other: 'Outro Motivo Especial'
    };
    return labels[cat];
  };

  return (
    <div className="space-y-6">
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-3 border-b border-stone-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-pulse"></div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest select-none">
            Painel Geral de Gestão G-Atende v3
          </span>
        </div>
        <span className="text-[10px] text-stone-400 font-bold select-none font-sans flex items-center gap-1">
          Unidade Responsável: <strong className="text-stone-800 uppercase">{myBranch?.name}</strong>
        </span>
      </motion.div>

      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_12px_40px_rgba(28,25,23,0.03)] group transition-all duration-300 hover:shadow-[0_16px_48px_rgba(28,25,23,0.06)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-6 -mt-6 select-none pointer-events-none transition-transform duration-700 group-hover:scale-110">
          <Building className="w-64 h-64 text-[#b45309]" />
        </div>
        
        {/* Subtle executive neon status accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600/30 via-amber-800 to-stone-900/40 rounded-t-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-75/10 text-amber-800 border border-amber-700/10 font-bold text-[9px] uppercase tracking-wider px-3.5 py-1">
                🏆 Liderança Regente Regional
              </Badge>
              <div className="flex items-center gap-1.5 text-[9px] text-[#b45309] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-600/10 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> SISTEMA ATIVO
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight uppercase leading-none italic font-sans">
              Gerência Geral: <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-800 to-amber-600 font-extrabold">{myBranch?.name}</span>
            </h1>
            <p className="text-xs text-stone-500 font-semibold max-w-xl leading-relaxed">
              Supervisão tática de consultores de alta performance, gerenciamento estratégico de carteiras órfãs e auditoria comercial de leads integrados.
            </p>
          </div>

          <Dialog open={isSalespersonOpen} onOpenChange={setIsSalespersonOpen}>
            <DialogTrigger render={
              <Button className="h-12 flex items-center justify-center gap-2 px-6 bg-stone-900 hover:bg-stone-800 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 active:scale-[0.97] transition-all rounded-xl border-none">
                <UserPlus className="w-4 h-4 text-amber-500 animate-bounce" /> Ativar Consultor
              </Button>
            } />
            <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-700" /> Ativar Consultor
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500 font-medium">Cadastrar e vincular um novo consultor de vendas na filial {myBranch?.name}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSalesperson} className="space-y-4 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Completo</Label>
                  <Input className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-900 focus:ring-0 focus:border-amber-700/50" placeholder="Ex: Rodrigo de Oliveira" value={newSalespersonName} onChange={e => setNewSalespersonName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Telefone / WhatsApp de Contato</Label>
                  <Input className="h-11 rounded-xl border-stone-200 text-xs font-bold bg-white text-stone-900 focus:ring-0 focus:border-amber-700/50" placeholder="Ex: (21) 98765-4321" value={newSalespersonPhone} onChange={e => setNewSalespersonPhone(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-11 text-xs uppercase font-black tracking-widest bg-amber-700 hover:bg-amber-800 text-white">
                  Habilitar Vendas
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics blocks row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-amber-700/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-700/10">
                  <Users className="w-4 h-4" />
                </span>
                Staff Ativo
              </span>
              <div className="pt-2">
                <div className="text-3xl font-black text-stone-900 tracking-tight font-sans">
                  {mySalespeople.length} <span className="text-xs text-stone-400 font-bold uppercase normal-case">consultores</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Equipe de showroom reportando em tempo real
                </p>
              </div>
            </div>
            
            {/* Visual Sparkline Graph */}
            <MiniSparkline points={[2, 3, 5, 4, 6, 8, mySalespeople.length || 3]} color="#b45309" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-blue-600/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-600/10">
                  <FileText className="w-4 h-4" />
                </span>
                Atendimentos Clínicos
              </span>
              <div className="pt-2">
                <div className="text-3xl font-black text-stone-900 tracking-tight font-sans">
                  {myBranchQuotes.length} <span className="text-xs text-stone-400 font-bold uppercase normal-case">leads</span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-1.5">
                  Volume de orçamentos gerados na unidade comercial
                </p>
              </div>
            </div>
            
            {/* Visual Sparkline Graph */}
            <MiniSparkline points={[5, 12, 8, 15, 22, 18, myBranchQuotes.length || 7]} color="#2563eb" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-emerald-600/30">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-500/10">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Faturamento Potencial
              </span>
              <div className="pt-2">
                <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
                  {formatCurrency(totalValue)}
                </div>
                <p className="text-[10px] text-stone-400 font-bold mt-2 uppercase tracking-wide">
                  Soma bruta de negociações em aberto
                </p>
              </div>
            </div>
            
            {/* Visual Sparkline Graph */}
            <MiniSparkline points={[15000, 42000, 31000, 58000, 72000, 64000, totalValue || 25000]} color="#10b981" />
          </div>
        </div>
      </div>

      {/* DYNAMIC NAVIGATION SCREEN RENDERING (HOME vs. TEAM) */}
      <div className="pt-2">
        {activeTab === 'team' ? (
          /* MANAGERS SCREEN: TEAM EDIT & MANAGE */
          <Card className="glass-card border-none bg-white pb-3 shadow-xs">
            <CardHeader className="pb-4 border-b border-stone-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-amber-700" /> Equipe de Showroom Ativa
                  </CardTitle>
                  <CardDescription className="text-xs text-stone-500 font-semibold">Editar nomes, realocar consultores e encaminhar remanejamentos comerciais.</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <Input 
                    placeholder="Filtrar por nome..." 
                    className="bg-white h-10 pl-10 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300 focus:ring-0"
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
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-6">Consultor</TableHead>
                    <TableHead className="text-center font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Atendimentos</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Potencial na Mão</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-6">Ações Táticas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalespeople.map(s => {
                    const sQuotes = myBranchQuotes.filter(q => q.createdBy === s.id && !q.isTransferred);
                    const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                    return (
                      <TableRow key={s.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                        <TableCell className="pl-6 uppercase">
                          <div className="font-bold text-stone-950">{s.name}</div>
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
                          <span className="font-mono text-xs font-extrabold text-stone-800 bg-stone-100 border border-stone-200/50 rounded-md px-2 py-0.5">{sQuotes.length}</span>
                        </TableCell>
                        <TableCell className="text-right font-black font-mono text-stone-900">{formatCurrency(sTotal)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditUserModal({ isOpen: true, user: s, name: s.name, phone: s.phone || '' })}
                              className="w-8 h-8 text-stone-400 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-all bg-transparent border-none"
                              title="Editar nome"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setSellerDetailsId(s.id)}
                              className="w-8 h-8 text-amber-700 hover:text-amber-800 hover:bg-amber-50 flex items-center justify-center transition-all bg-transparent border-none"
                              title="Visualizar orçamentos"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => { setUserToTransfer(s.id); setTransferDialogOpen(true); }}
                              className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-550/10 flex items-center justify-center transition-all bg-transparent border-none"
                              title="Remanejar para outra Loja"
                            >
                              <Shuffle className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => { setUserToReassign(s.id); setReassignDialogOpen(true); }}
                              className="w-8 h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all bg-transparent border-none"
                              title="Repassar carteira de clientes"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteUserModal({ isOpen: true, user: s })}
                              className="w-8 h-8 text-stone-300 hover:text-rose-600 hover:bg-stone-100 flex items-center justify-center transition-all animate-none bg-transparent border-none"
                              title="Remover consultor da unidade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {filteredSalespeople.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-stone-400 font-bold border-none text-xs uppercase tracking-widest">
                        Nenhum consultor registrado nesta unidade.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* MANAGERS SCREEN: MAIN HOME WORKFLOW HISTORY */
          <Card className="glass-card border-none bg-white pb-3 shadow-xs">
            <CardHeader className="pb-4 border-b border-stone-100">
              <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-amber-700" /> Fluxo Geral de Propostas na Loja
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 font-semibold">Tabela de supervisão imediata com monitoramento e ferramenta de fechamento VIP.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-stone-50/50">
                  <TableRow className="border-stone-100">
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-6">Cliente</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Consultor</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Previsão Contato</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Valor Proposta</TableHead>
                    <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Status</TableHead>
                    <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-6">Supervisão Fechamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBranchQuotes.map(q => {
                    const salesperson = mySalespeople.find(s => s.id === q.createdBy);
                    return (
                      <TableRow key={q.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                        <TableCell className="font-bold text-stone-950 pl-6 uppercase">{q.clientName}</TableCell>
                        <TableCell className="text-stone-600 font-bold uppercase text-[11px]">{salesperson?.name || 'Vendedor Removido'}</TableCell>
                        <TableCell className="text-stone-500 font-mono text-xs">{new Date(q.returnDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-black text-stone-950 font-mono">{formatCurrency(q.value)}</TableCell>
                        <TableCell>
                          {q.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[8px] uppercase tracking-wide">Pendente</Badge>}
                          {q.status === 'won' && <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[8px] uppercase tracking-wide">Ganho (Venda!)</Badge>}
                          {q.status === 'lost' && <Badge className="bg-stone-100 text-stone-400 border-none font-bold text-[8px] uppercase tracking-wide">Perdido</Badge>}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-600 hover:text-white font-black uppercase text-[9px] tracking-widest h-8 px-3 rounded-lg transition-all flex items-center justify-end gap-1.5 ml-auto border border-emerald-500/10" 
                            onClick={() => handleManagerMessage(q)}
                          >
                            <Send className="w-3.5 h-3.5" /> Chamar Gerente VIP
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {myBranchQuotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-stone-400 font-bold border-none text-xs uppercase tracking-widest">
                        Nenhum orçamento pendente nesta filial ativa.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Seller Details Dialog view items */}
      <Dialog open={!!sellerDetailsId} onOpenChange={(open) => !open && setSellerDetailsId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl border-stone-200">
          <DialogHeader className="border-b border-stone-100 pb-4">
            <DialogTitle className="text-lg flex items-center gap-2 text-stone-900 font-extrabold uppercase italic">
              <Users className="w-6 h-6 text-amber-700" /> Relatório Individual de Vendas
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Acompanhamento detalhado das tratativas comerciais do consultor <strong>{detailedSeller?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          {detailedSeller && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardHeader className="pb-1.5">
                     <CardTitle className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Propostas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-extrabold text-stone-900 text-xl">{detailedSellerQuotes.length} Unidades</div>
                  </CardContent>
                </Card>
                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardHeader className="pb-1.5">
                     <CardTitle className="text-[10px] font-black uppercase tracking-wider text-amber-800">Moeda Potencial Acumulada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-black text-stone-900 text-xl font-mono">{formatCurrency(detailedSellerTotal)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-stone-250 bg-white">
                <Table>
                  <TableHeader className="bg-stone-50">
                    <TableRow className="border-stone-100">
                      <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pl-4">Cliente / Produto</TableHead>
                      <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Motivo</TableHead>
                      <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Retorno</TableHead>
                      <TableHead className="font-extrabold uppercase text-[9px] tracking-wider text-stone-400">Status</TableHead>
                      <TableHead className="text-right font-extrabold uppercase text-[9px] tracking-wider text-stone-400 pr-4">Montante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedSellerQuotes.map(q => (
                      <TableRow key={q.id} className="border-stone-100">
                        <TableCell className="pl-4">
                          <div className="font-bold text-stone-900 uppercase text-xs">{q.clientName}</div>
                          <div className="text-[10.5px] text-stone-400 font-semibold mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 M-3" /> {q.productInterest || 'Uso Geral'}
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge className="bg-stone-100 text-stone-700 border-none font-bold text-[8px] uppercase tracking-wide">
                             {getCategoryLabel(q.category)}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-stone-600">
                           {new Date(q.returnDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {q.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[8.5px] uppercase">Aberto</Badge>}
                          {q.status === 'won' && <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[8.5px] uppercase">Ganho!</Badge>}
                          {q.status === 'lost' && <Badge className="bg-stone-100 text-stone-400 border-none font-bold text-[8.5px] uppercase">Perdido</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-black font-mono text-stone-900 pr-4">{formatCurrency(q.value)}</TableCell>
                      </TableRow>
                    ))}
                    {detailedSellerQuotes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-stone-400 py-8 font-bold text-xs uppercase tracking-widest">Este consultor ainda não gerou propostas.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* dialog for transfer */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-amber-700" /> Transferência de Consultor
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Mover profissional da filial {myBranch?.name} para outra unidade regional.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Selecione a Filial de Destino</Label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="">Selecione a filial...</option>
                {otherBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleTransfer} className="w-full h-11 text-xs uppercase font-black bg-amber-700 hover:bg-amber-800 text-white">
              Mudar Consultor de Loja
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* dialog for reassign quotes */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-amber-700" /> Carteira de Repasse VIP
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Remapear todos os orçamentos ativos desse profissional desligado para outro consultor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Consultor Sucessor (Herdeiro)</Label>
              <select
                value={targetSalesperson}
                onChange={(e) => setTargetSalesperson(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="">Escolher herdeiro...</option>
                {mySalespeople.filter(s => s.id !== userToReassign).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleReassign} className="w-full h-11 text-xs uppercase font-black bg-stone-900 text-white hover:bg-stone-800">
              Transferir Todos os Ativos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* edit modal title adjustment */}
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '', phone: '' })}>
        <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-extrabold uppercase italic">Editar Consultor</DialogTitle>
            <DialogDescription className="text-xs text-stone-500">Ajuste o nome do consultor ou telefone de contato.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Registrado</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Telefone / WhatsApp Comercial</Label>
              <Input className="h-11 bg-white rounded-xl border-stone-200 text-xs font-bold text-stone-1000" value={editUserModal.phone} onChange={(e) => setEditUserModal(m => ({ ...m, phone: e.target.value }))} required />
            </div>
            <DialogFooter className="gap-2 shrink-0 flex-row justify-end mt-4">
              <Button type="button" variant="ghost" className="h-10 text-xs text-stone-500" onClick={() => setEditUserModal({ isOpen: false, user: null, name: '', phone: '' })}>Sair</Button>
              <Button type="submit" className="h-10 text-xs font-black uppercase tracking-widest bg-amber-700 hover:bg-amber-800 text-white border-transparent">Gravar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User details confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteUserModal.isOpen}
        onOpenChange={(open) => !open && setDeleteUserModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteUser}
        title="Excluir Perfil"
        description={
          <>
            Você está prestes a desativar permanentemente o acesso comercial de <strong>{deleteUserModal.user?.name}</strong>. Esta ação não poderá ser desfeita.
          </>
        }
        confirmText="Remover Contrato"
        cancelText="Cancelar"
        variant="destructive"
      />

    </div>
  );
};
