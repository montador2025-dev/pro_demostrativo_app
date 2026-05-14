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

  if (!currentUser?.branchId) {
    return <div className="p-8 text-center text-muted-foreground">O gerente atual não está vinculado a uma filial.</div>;
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
    const today = new Date().toLocaleDateString('pt-BR');
    const productLines = quote.productInterest 
      ? `• *${quote.productInterest}*\n   📦 _Geral_` 
      : `• *Atendimento Personalizado*\n   📦 _Móveis e Decoração_`;

    const msg = `Sono Show Móveis\n\nOlá *${quote.clientName}*! \nAqui é o(a) *${currentUser.name}*, gerente da loja *${myBranch?.name}*.\n\n━━━━━━━━━━━━━━━\n*📝 ORÇAMENTO*\n━━━━━━━━━━━━━━━\n${productLines}\n\n💰 *Valor:* ${formatCurrency(quote.value)}\n📅 *Data:* ${today}\n⏳ *Validade:* 2 dias\n━━━━━━━━━━━━━━━\n\nGostaria de saber se o orçamento ainda é de seu interesse e se posso ajudar em algo para fecharmos o negócio hoje!`;
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
      
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden text-white">
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
                  <span className="w-2 h-2 rounded-full bg-secondary mr-2 shadow-glow"></span>
                  {myBranch?.name}
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Painel de <span className="text-secondary">Gestão</span></h1>
              <p className="text-white/90 text-lg font-medium">Bem-vindo, <strong>{currentUser.name}</strong>. Controle sua equipe e métricas.</p>
            </div>
            <Dialog open={isSalespersonOpen} onOpenChange={setIsSalespersonOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary hover:bg-slate-50 shadow-lg shadow-black/10 font-bold px-6 py-2.5 rounded-xl transition-all"><Users className="w-4 h-4 mr-2" /> Novo Vendedor</Button>
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold">Cadastrar Vendedor</Button>
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
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6"><div className="text-4xl font-black text-slate-900">{mySalespeople.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Orçamentos Ativos</CardTitle>
            <FileText className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6"><div className="text-4xl font-black text-slate-900">{myBranchQuotes.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white/80 uppercase tracking-wider">Potencial (Filial)</CardTitle>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-black tracking-tight">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-white/70 mt-2 font-medium">Soma de todo o potencial de venda</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 lg:w-[500px] p-1 bg-slate-100 rounded-xl shadow-inner mb-8">
          <TabsTrigger value="team" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold">
            Equipe de Vendas
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold">
            Histórico de Orçamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <Card className="shadow-lg border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-primary/5 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-primary font-bold">Equipe Comercial</CardTitle>
                  <CardDescription>Resumo de orçamentos e performance da sua equipe.</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input 
                    placeholder="Buscar vendedor..." 
                    className="pl-9 bg-white border-slate-200 focus-visible:ring-primary rounded-xl"
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
                          <Badge variant="secondary" className="font-mono bg-primary/5 text-primary font-bold">{sQuotes.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary font-mono">
                          {formatCurrency(sTotal)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100" title="Editar Nome" onClick={() => setEditUserModal({ isOpen: true, user: s, name: s.name })}>
                            <Edit className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-primary border-primary/20 hover:bg-primary/5 shadow-sm" title="Ver Detalhes do Vendedor" onClick={() => setSellerDetailsId(s.id)}>
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
            <CardHeader className="pb-4 border-b border-primary/5 bg-primary/5">
              <CardTitle className="text-primary font-bold">Histórico de Orçamentos</CardTitle>
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
                        <TableCell className="font-bold text-primary">{formatCurrency(q.value)}</TableCell>
                        <TableCell>
                          {q.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-700">Pêndente</Badge>}
                          {q.status === 'won' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 font-bold">Ganho</Badge>}
                          {q.status === 'lost' && <Badge variant="outline" className="bg-rose-50 text-rose-700">Perdido</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-mono text-slate-500">{formatPhone(q.clientPhone)}</span>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold h-7" onClick={() => handleManagerMessage(q)}>
                              <Send className="w-3 h-3 mr-2" /> WhatsApp
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
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Relatório Individual: {detailedSeller?.name}
            </DialogTitle>
            <DialogDescription>
              Acompanhamento de todos os orçamentos tratativos por este consultor.
            </DialogDescription>
          </DialogHeader>
          
          {detailedSeller && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-none shadow-sm">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm text-slate-500">Volume de Atendimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold text-2xl">{detailedSellerQuotes.length} <span className="text-sm font-normal text-slate-500">orçamentos</span></div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm text-primary font-bold">Potencial na Mão do Vendedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-black text-2xl text-primary">{formatCurrency(detailedSellerTotal)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Cliente / Produto</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Motivo Retenção</TableHead>
                      <TableHead>Retorno</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Montante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedSellerQuotes.map(q => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">{q.clientName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3" /> {q.productInterest || 'Não informado'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{q.clientPhone}</div>
                          <a href={`https://wa.me/${q.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                          </a>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="bg-slate-100 text-slate-700 font-normal">
                             {getCategoryLabel(q.category)}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-sm flex items-center gap-1">
                           <CalendarCheck className="w-3 h-3 text-slate-400" />
                           {new Date(q.returnDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {q.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-700">Pendente</Badge>}
                          {q.status === 'won' && <Badge variant="outline" className="bg-green-50 text-green-700">Ganho</Badge>}
                          {q.status === 'lost' && <Badge variant="outline" className="bg-red-50 text-red-700">Perdido</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(q.value)}</TableCell>
                      </TableRow>
                    ))}
                    {detailedSellerQuotes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-6">Este vendedor ainda não gerou orçamentos.</TableCell>
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
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold">Salvar Alterações</Button>
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
