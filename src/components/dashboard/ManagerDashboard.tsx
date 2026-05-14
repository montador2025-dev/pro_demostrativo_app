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
import { Users, Shuffle, UserMinus, AlertCircle, TrendingUp, Search, Eye, FileText, CalendarCheck, Edit, Trash2, Send, Phone } from 'lucide-react';
import { Badge } from '../ui/badge';
import { QuoteCategory, User } from '../../types';
import { toast } from 'sonner';

export const ManagerDashboard = () => {
  const { currentUser, branches, users, quotes, addUser, updateUser, deleteUser, transferUser, reassignQuotes } = useAppContext();
  
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

  const [activeTab, setActiveTab] = useState('team');

  if (!currentUser?.branchId) {
    return <div className="p-8 text-center text-muted-foreground">O gerente atual não está vinculado a uma filial.</div>;
  }

  const myBranch = branches.find(b => b.id === currentUser.branchId);
  const mySalespeople = users.filter(u => u.role === 'salesperson' && u.branchId === myBranch?.id);
  const otherBranches = branches.filter(b => b.id !== myBranch?.id);
  
  // Only consider quotes created in THIS branch
  const myBranchQuotes = quotes.filter(q => q.branchId === myBranch?.id);
  const totalValue = myBranchQuotes.reduce((sum, q) => sum + q.value, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const quotesToday = myBranchQuotes.filter(q => {
    const returnDate = new Date(q.returnDate);
    returnDate.setHours(0, 0, 0, 0);
    return q.status === 'pending' && returnDate.getTime() === today.getTime();
  });
  
  const totalValueToday = quotesToday.reduce((sum, q) => sum + q.value, 0);

  const filteredSalespeople = mySalespeople.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const detailedSeller = mySalespeople.find(s => s.id === sellerDetailsId);
  const detailedSellerQuotes = detailedSeller ? myBranchQuotes.filter(q => q.createdBy === detailedSeller.id && !q.isTransferred) : [];
  const detailedSellerTotal = detailedSellerQuotes.reduce((acc, q) => acc + q.value, 0);

  const handleAddSalesperson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalespersonName.trim()) return;
    addUser(newSalespersonName, 'salesperson', currentUser.branchId);
    setNewSalespersonName('');
    setIsSalespersonOpen(false);
    toast.success('Vendedor cadastrado!');
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !editUserModal.name.trim()) return;
    updateUser(editUserModal.user.id, editUserModal.name);
    setEditUserModal({ isOpen: false, user: null, name: '' });
    toast.success('Nome alterado com sucesso!');
  };

  const handleDeleteUser = () => {
    if (!deleteUserModal.user) return;
    deleteUser(deleteUserModal.user.id);
    setDeleteUserModal({ isOpen: false, user: null });
    toast.success('Vendedor excluído permanentemente.');
  };

  const handleTransfer = () => {
    if (!userToTransfer || !targetBranch) return;
    transferUser(userToTransfer, targetBranch);
    setTransferDialogOpen(false);
    setUserToTransfer('');
    setTargetBranch('');
  };

  const handleReassign = () => {
    if (!userToReassign || !targetSalesperson) return;
    reassignQuotes(userToReassign, targetSalesperson);
    setReassignDialogOpen(false);
    setUserToReassign('');
    setTargetSalesperson('');
  };

  const handleManagerMessage = (quote: any) => {
    const msg = `Olá *${quote.clientName}*, aqui é o(a) *${currentUser.name}*, gerente da loja *${myBranch?.name}*. Gostaria de saber se o orçamento de *${formatCurrency(quote.value)}* ainda é de seu interesse e se posso ajudar em algo para fecharmos o negócio.`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  const getCategoryLabel = (cat: QuoteCategory) => {
    const labels: Record<QuoteCategory, string> = {
      card_turning: 'Aguardando Virada do Cartão',
      researching: 'Apenas Pesquisando',
      price_high: 'Achou o Preço Alto',
      needs_spouse: 'Precisa falar com cônjuge',
      other: 'Outros Motivos'
    };
    return labels[cat];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-800 p-8 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 opacity-15">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M47.7,-60.2C59.6,-50.3,65.6,-33.5,70.5,-15.8C75.4,1.8,79.2,20.4,72.2,34.4C65.2,48.4,47.4,57.8,29.9,62.8C12.4,67.8,-4.8,68.4,-20.9,64.1C-37.1,59.9,-52.2,50.7,-61.4,36.8C-70.6,22.8,-73.9,4.2,-69,-11.9C-64.2,-28,-51.1,-41.6,-36.8,-51C-22.6,-60.5,-7.2,-65.7,5.5,-72C18.1,-78.4,35.9,-70.1,47.7,-60.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1 font-medium shadow-none">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 shadow-glow"></span>
                  {myBranch?.name}
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Gestão de <span className="text-emerald-200">Sucesso</span></h1>
              <p className="text-emerald-50 text-lg font-medium">Bem-vindo, <strong>{currentUser.name}</strong>. Sua meta é o nosso norte.</p>
            </div>
            <Dialog open={isSalespersonOpen} onOpenChange={setIsSalespersonOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-black/10 font-bold px-6 py-2.5 rounded-xl transition-all"><Users className="w-4 h-4 mr-2" /> Novo Vendedor</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Vendedor</DialogTitle>
                  <DialogDescription>Cadastre um novo vendedor para a filial {myBranch?.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSalesperson} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Vendedor</Label>
                    <Input placeholder="Ex: João Souza" value={newSalespersonName} onChange={e => setNewSalespersonName(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Cadastrar Vendedor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vendedores Ativos</CardTitle>
            <Users className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-6"><div className="text-4xl font-black text-slate-900">{mySalespeople.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Metas p/ Hoje</CardTitle>
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-black text-emerald-600">{quotesToday.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium italic">Clientes para retorno hoje</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-green-100 uppercase tracking-wider">Potencial para Fechar Hoje</CardTitle>
            <TrendingUp className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-black tracking-tight">{formatCurrency(totalValueToday)}</div>
            <p className="text-xs text-green-100 mt-2 font-medium">Foco total nestes contatos</p>
          </CardContent>
        </Card>
      </div>

      {quotesToday.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Operação Fechamento: Hoje!</h3>
              <p className="text-emerald-700 font-medium">Sua filial tem {quotesToday.length} clientes aguardando retorno neste exato momento.</p>
            </div>
          </div>
          <Button 
            className="h-auto py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl px-6 font-bold shadow-lg shadow-emerald-600/20"
            onClick={() => {
              setActiveTab('history');
              toast.info("Mostrando histórico de orçamentos.");
            }}
          >
            Ver Lista de Contatos
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 lg:w-[500px] p-1 bg-slate-100 rounded-xl shadow-inner mb-8">
          <TabsTrigger value="team" className="py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black">
            Equipe de Vendas
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black">
            Histórico de Orçamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <Card className="shadow-lg border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-emerald-50 bg-emerald-50/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-emerald-900 font-bold">Equipe Comercial</CardTitle>
                  <CardDescription>Resumo de orçamentos e performance da sua equipe.</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input 
                    placeholder="Buscar vendedor..." 
                    className="pl-9 bg-white border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Vendedor</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Orçamentos</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Montante Total</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalespeople.map(s => {
                    const sQuotes = myBranchQuotes.filter(q => q.createdBy === s.id && !q.isTransferred);
                    const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                    return (
                      <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-semibold text-slate-800">{s.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono bg-emerald-50 text-emerald-700 font-bold">{sQuotes.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-700">
                          {formatCurrency(sTotal)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100" title="Editar Nome" onClick={() => setEditUserModal({ isOpen: true, user: s, name: s.name })}>
                            <Edit className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Ver Detalhes do Vendedor" onClick={() => setSellerDetailsId(s.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Transferir Vendedor" onClick={() => { setUserToTransfer(s.id); setTransferDialogOpen(true); }}>
                            <Shuffle className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Desligar e Repassar Clientes" onClick={() => { setUserToReassign(s.id); setReassignDialogOpen(true); }}>
                            <UserMinus className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50" title="Excluir Definitivamente" onClick={() => setDeleteUserModal({ isOpen: true, user: s })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredSalespeople.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-slate-400 border-dashed">
                        {searchTerm ? 'Nenhum vendedor encontrado.' : 'Sua equipe ainda não possui vendedores.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-lg border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-emerald-50 bg-emerald-50/30">
              <CardTitle className="text-emerald-900 font-bold">Histórico de Orçamentos</CardTitle>
              <CardDescription>Acompanhe todos os orçamentos realizados nesta filial.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Cliente</TableHead>
                    <TableHead className="font-bold text-slate-700">Vendedor</TableHead>
                    <TableHead className="font-bold text-slate-700">Produto</TableHead>
                    <TableHead className="font-bold text-slate-700">Retorno</TableHead>
                    <TableHead className="font-bold text-slate-700">Valor</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBranchQuotes.map(q => {
                    const salesperson = mySalespeople.find(s => s.id === q.createdBy);
                    return (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium text-slate-900">{q.clientName}</TableCell>
                        <TableCell className="text-slate-600">{salesperson?.name || 'Desconhecido'}</TableCell>
                        <TableCell className="text-slate-600">{q.productInterest || '-'}</TableCell>
                        <TableCell className="text-slate-600">{new Date(q.returnDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-bold text-emerald-700">{formatCurrency(q.value)}</TableCell>
                        <TableCell>
                          {q.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-700">Pêndente</Badge>}
                          {q.status === 'won' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 font-bold">Ganho</Badge>}
                          {q.status === 'lost' && <Badge variant="outline" className="bg-rose-50 text-rose-700">Perdido</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              {formatPhone(q.clientPhone)}
                            </span>
                            <Button variant="ghost" size="sm" className="text-[#25D366] hover:text-white hover:bg-[#25D366] font-black h-8 shadow-sm transition-all" onClick={() => handleManagerMessage(q)}>
                              <Send className="w-3 h-3 mr-2" /> Contato Direto
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seller Details Dialog */}
      <Dialog open={!!sellerDetailsId} onOpenChange={(open) => !open && setSellerDetailsId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto border-none p-0 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <DialogHeader className="relative z-10">
               <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
                 <div className="bg-white p-2 rounded-xl">
                   <Users className="w-6 h-6 text-emerald-600" />
                 </div>
                 {detailedSeller?.name}
               </DialogTitle>
               <DialogDescription className="text-emerald-50 font-medium opacity-80 text-lg">
                 Raio-X de performance e retenção de vendas
               </DialogDescription>
             </DialogHeader>
          </div>
          
          {detailedSeller && (
            <div className="p-8 bg-slate-50 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl bg-white rounded-3xl group overflow-hidden">
                  <div className="h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Demandas Geradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-black text-4xl text-slate-900">{detailedSellerQuotes.length} <span className="text-xl font-medium text-slate-400">orçamentos</span></div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-white rounded-3xl group overflow-hidden">
                   <div className="h-1 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600">Volume em Negociação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-black text-4xl text-emerald-700 tracking-tighter">{formatCurrency(detailedSellerTotal)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-100/50">
                    <TableRow>
                      <TableHead className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Prospecto</TableHead>
                      <TableHead className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Contato</TableHead>
                      <TableHead className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Proposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedSellerQuotes.map(q => (
                      <TableRow key={q.id} className="hover:bg-emerald-50/20 transition-colors">
                        <TableCell className="px-6 py-6 border-b border-slate-50">
                          <div className="font-black text-slate-900 text-lg tracking-tight">{q.clientName}</div>
                          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                            <FileText className="w-3 h-3 text-emerald-400" /> {q.productInterest || 'Serviços Diversos'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6 border-b border-slate-50">
                          <div className="flex flex-col gap-1.5">
                             <div className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg w-fit flex items-center gap-2">
                               <Phone className="w-3 h-3 text-emerald-500" />
                               {formatPhone(q.clientPhone)}
                             </div>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="text-[#25D366] hover:text-white hover:bg-[#25D366] w-fit font-black text-xs px-2 h-7 rounded-lg"
                               onClick={() => handleManagerMessage(q)}
                             >
                                <Send className="w-3 h-4 mr-1.5" /> WhatsApp Direto
                             </Button>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6 border-b border-slate-50 text-right">
                          <div className="font-black text-emerald-700 text-2xl tracking-tighter">{formatCurrency(q.value)}</div>
                          <div className={`text-[10px] uppercase font-black tracking-widest mt-1 ${q.status === 'pending' ? 'text-amber-500' : q.status === 'won' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {q.status === 'pending' ? 'Em Aberto' : q.status === 'won' ? 'Convertido' : 'Perdido'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {detailedSellerQuotes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-400 py-12 italic">Nenhum registro encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Vendedor</DialogTitle>
            <DialogDescription>
              Transfere o vendedor para outra filial. Os orçamentos gerados aqui continuarão contando para a <strong>{myBranch?.name}</strong> em modo "Legado".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Para qual filial?</Label>
              <Select value={targetBranch} onValueChange={setTargetBranch}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {otherBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTransfer} className="w-full">Realizar Transferência</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Desligamento / Repasse de Carteira</DialogTitle>
            <DialogDescription>
              Se o vendedor for demitido ou sair, selecione quem assumirá os clientes pendentes dele.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Vendedor Responsável</Label>
              <Select value={targetSalesperson} onValueChange={setTargetSalesperson}>
                <SelectTrigger><SelectValue placeholder="Selecione o sucessor" /></SelectTrigger>
                <SelectContent>
                  {mySalespeople.filter(s => s.id !== userToReassign).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleReassign} variant="destructive" className="w-full shadow-md">Transferir Carteira e Orçamentos</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vendedor</DialogTitle>
            <DialogDescription>Corrija o nome do vendedor caso tenha cadastrado errado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Vendedor</Label>
              <Input value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUserModal({ isOpen: false, user: null, name: '' })}>Cancelar</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteUserModal.isOpen} onOpenChange={(v) => !v && setDeleteUserModal({ isOpen: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Excluir Vendedor
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir <strong>{deleteUserModal.user?.name}</strong>. Os orçamentos atrelados a ele ficarão órfãos na estatística desta loja. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteUserModal({ isOpen: false, user: null })}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser}>Sim, Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
