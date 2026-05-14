import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/formatters';
import { Building2, PlusCircle, Users, BarChart3, TrendingUp, Store, ShieldCheck, UserCircle2, Search, FileText, CalendarCheck, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { User, Branch } from '../../types';

export const SupervisorDashboard = () => {
  const { branches, users, quotes, addBranch, updateBranch, deleteBranch, addUser, updateUser, deleteUser } = useAppContext();
  
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  
  // States for Edit/Delete actions
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
    updateUser(editUserModal.user.id, editUserModal.name);
    setEditUserModal({ isOpen: false, user: null, name: '' });
    toast.success('Usuário atualizado com sucesso!');
  };

  const handleDeleteUser = () => {
    if (!deleteUserModal.user) return;
    deleteUser(deleteUserModal.user.id);
    setDeleteUserModal({ isOpen: false, user: null });
    toast.success('Usuário removido!');
  };

  const handleEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBranchModal.branch || !editBranchModal.name.trim()) return;
    updateBranch(editBranchModal.branch.id, editBranchModal.name);
    setEditBranchModal({ isOpen: false, branch: null, name: '' });
    toast.success('Filial atualizada!');
  };

  const filteredBranches = branchMetrics.filter(bm => 
    bm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (bm.manager?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const detailedBranch = branchMetrics.find(bm => bm.id === branchDetailsId);
  const detailedBranchQuotes = detailedBranch ? quotes.filter(q => q.branchId === detailedBranch.id && !q.isTransferred) : [];

  if (branchDetailsId && detailedBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 -mx-4 md:-mx-8 -mt-8 p-4 md:p-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:rotate-6 transition-transform">
                <Store className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 select-none">
                  {detailedBranch.name}
                </h1>
                <div className="flex items-center gap-2 text-indigo-100 font-bold uppercase tracking-widest text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Relatório Executivo Detalhado
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setBranchDetailsId(null)}
              variant="outline" 
              className="bg-white text-indigo-900 border-none hover:bg-indigo-50 transition-all font-black px-8 py-6 rounded-2xl shadow-xl hover:shadow-indigo-500/20 active:scale-95 text-lg"
            >
              Voltar ao Início
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-2xl text-white rounded-3xl overflow-hidden hover:bg-white/15 transition-colors group">
              <CardHeader className="pb-3 border-b border-white/10 px-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Gestão da Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-black text-white group-hover:translate-x-1 transition-transform">
                  {detailedBranch.manager?.name || 'Vago'}
                </div>
                <p className="text-indigo-200 text-sm mt-1 font-medium italic opacity-70">Responsável Administrativo</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-2xl text-white rounded-3xl overflow-hidden hover:bg-white/15 transition-colors group">
              <CardHeader className="pb-3 border-b border-white/10 px-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Fluxo de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-5xl font-black text-white group-hover:scale-110 origin-left transition-transform">
                  {detailedBranch.quotesCount}
                </div>
                <p className="text-indigo-200 text-sm mt-1 font-medium">Orçamentos em Aberto</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none text-slate-900 rounded-3xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
              <CardHeader className="pb-3 border-b border-indigo-50 bg-indigo-50/80 px-6">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" /> Montante de Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-4xl font-black text-indigo-700 tracking-tighter">
                  {formatCurrency(detailedBranch.totalValue)}
                </div>
                <p className="text-slate-500 text-sm mt-1 font-bold">Potencial Bruto Acumulado</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Content Tabs */}
          <Tabs defaultValue="vendedores" className="w-full">
            <TabsList className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 mb-8 w-full md:w-fit">
              <TabsTrigger value="vendedores" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white font-black rounded-xl px-10 py-3 transition-all">
                Equipe de Vendas
              </TabsTrigger>
              <TabsTrigger value="orcamentos" className="data-[state=active]:bg-white data-[state=active]:text-indigo-900 text-white font-black rounded-xl px-10 py-3 transition-all">
                Histórico Comercial
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="vendedores" className="animate-in slide-in-from-left-4 duration-500">
              <Card className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden border-t-8 border-indigo-500">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                  <CardTitle className="text-indigo-900 text-2xl font-black tracking-tight">Análise Individual por Vendedor</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Performance de captação e volume financeiro por consultor.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-100/50">
                      <TableRow>
                        <TableHead className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Consultor</TableHead>
                        <TableHead className="text-right px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Volume</TableHead>
                        <TableHead className="text-right px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Potencial Individual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedBranch.salespeople.map(s => {
                        const sQuotes = detailedBranchQuotes.filter(q => q.createdBy === s.id);
                        const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                        return (
                          <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-all group">
                            <TableCell className="px-8 py-6 font-bold text-slate-900 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-6 transition-transform">
                                {s.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg tracking-tight">{s.name}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ativo nesta Unidade</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-8 py-6">
                              <Badge className="bg-indigo-600 text-white border-none px-4 py-1 rounded-lg font-black text-sm shadow-md">
                                {sQuotes.length} <span className="ml-1 opacity-60 font-medium">unid</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-8 py-6">
                              <div className="font-black text-indigo-700 text-2xl tracking-tighter">
                                {formatCurrency(sTotal)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {detailedBranch.salespeople.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-400 py-24 italic bg-slate-50/30">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                              <Users className="w-16 h-16" />
                              <span className="text-xl font-black">Nenhum consultor ativo nesta unidade</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orcamentos" className="animate-in slide-in-from-right-4 duration-500">
              <Card className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden border-t-8 border-blue-500">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                  <CardTitle className="text-indigo-900 text-2xl font-black tracking-tight">Fluxo de Negociações</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Listagem completa de todos os orçamentos ativos na unidade.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-100/50">
                      <TableRow>
                        <TableHead className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Cliente & Interesse</TableHead>
                        <TableHead className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Consultor</TableHead>
                        <TableHead className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Agenda Retorno</TableHead>
                        <TableHead className="px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Situação</TableHead>
                        <TableHead className="text-right px-8 py-5 font-black text-slate-800 uppercase text-xs tracking-wider">Proposta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedBranchQuotes.map(q => {
                        const qSeller = users.find(u => u.id === q.createdBy);
                        return (
                          <TableRow key={q.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="px-8 py-6">
                              <div className="font-black text-slate-900 text-lg tracking-tight">{q.clientName}</div>
                              <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                {q.productInterest || 'Serviços Diversos'}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-6 font-bold text-slate-600">{qSeller?.name}</TableCell>
                            <TableCell className="px-8 py-6">
                              <div className="flex items-center gap-2 text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
                                <CalendarCheck className="w-4 h-4 text-indigo-500" />
                                {new Date(q.returnDate).toLocaleDateString('pt-BR')}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              {q.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black px-3 py-1 text-xs">Aguardando</Badge>}
                              {q.status === 'won' && <Badge className="bg-emerald-500 hover:bg-emerald-600 font-black px-3 py-1 text-xs shadow-lg shadow-emerald-200">Ganhamos</Badge>}
                              {q.status === 'lost' && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-black px-3 py-1 text-xs">Perdemos</Badge>}
                            </TableCell>
                            <TableCell className="text-right px-8 py-6">
                              <div className="font-black text-indigo-700 text-2xl tracking-tighter">
                                {formatCurrency(q.value)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {detailedBranchQuotes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400 py-24 italic bg-slate-50/30">
                            Nenhuma movimentação registrada no histórico comercial.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <Badge variant="outline" className="mb-2 bg-indigo-50 text-indigo-600 border-indigo-200">Painel Executivo</Badge>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Visão <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Global</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Acompanhe o desempenho, edite informações gerenciais e avalie o impacto financeiro de todas as {branches.length} filiais em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <Dialog open={isBranchOpen} onOpenChange={setIsBranchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white"><Building2 className="w-4 h-4 mr-2" /> Nova Filial</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Filial</DialogTitle>
                <DialogDescription>Adicione uma nova loja à rede da empresa.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBranch} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Filial</Label>
                  <Input placeholder="Ex: Filial Sul (04)" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Cadastrar Filial</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isManagerOpen} onOpenChange={setIsManagerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><PlusCircle className="w-4 h-4 mr-2" /> Novo Gerente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Gerente</DialogTitle>
                <DialogDescription>Atribua um gerente responsável a uma filial.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddManager} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Gerente</Label>
                  <Input placeholder="Ex: Roberto Silva" value={newManagerName} onChange={e => setNewManagerName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Filial de Atuação</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch} required>
                    <SelectTrigger><SelectValue placeholder="Selecione a filial" /></SelectTrigger>
                    <SelectContent>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Cadastrar Gerente</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Unidades Totais</CardTitle>
            <Store className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{branches.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Força de Vendas</CardTitle>
            <Users className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{salespeople.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Volume Orçamentos</CardTitle>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{quotes.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Potencial Global</CardTitle>
            <TrendingUp className="w-5 h-5 text-indigo-200" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black">{formatCurrency(totalQuotesValue)}</div>
             <p className="text-xs text-indigo-200 mt-1">Soma de todas as filiais</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Relatório Detalhado das Filiais</h2>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar filial ou gerente..." 
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBranches.map(bm => (
            <Card 
              key={bm.id} 
              className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer active:scale-[0.99]"
              onClick={() => setBranchDetailsId(bm.id)}
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div className="group flex-1">
                    <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
                      <Store className="w-5 h-5 text-indigo-500" />
                      {bm.name}
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setEditBranchModal({ isOpen: true, branch: bm as any, name: bm.name })}}>
                        <Edit className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                      Gerente: <span className="font-semibold text-slate-900 group/mgr relative">
                        {bm.manager ? bm.manager.name : <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Sem Gerente</span>}
                        {bm.manager && (
                          <div className="inline-flex opacity-0 group-hover/mgr:opacity-100 transition-opacity ml-2">
                             <Button variant="ghost" size="icon" className="h-5 w-5 bg-white border shadow-sm" onClick={(e) => { e.stopPropagation(); setEditUserModal({ isOpen: true, user: bm.manager!, name: bm.manager!.name })}}>
                                <Edit className="w-3 h-3 text-blue-600" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-5 w-5 bg-white border shadow-sm ml-1 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteUserModal({ isOpen: true, user: bm.manager! })}}>
                                <Trash2 className="w-3 h-3 text-red-500" />
                             </Button>
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Montante</div>
                    <div className="text-xl font-bold text-indigo-700">{formatCurrency(bm.totalValue)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-white">
                  <div className="flex justify-between text-sm text-slate-500 mb-3 font-medium">
                    <span>Equipe de Vendas ({bm.salespeople.length})</span>
                    <span>Orçamentos</span>
                  </div>
                  
                  {bm.salespeople.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-400 border border-dashed rounded-lg">
                      Nenhum vendedor cadastrado nesta loja.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {bm.salespeople.map(salesperson => {
                        const salespersonQuotes = quotes.filter(q => q.createdBy === salesperson.id && !q.isTransferred);
                        const salespersonTotal = salespersonQuotes.reduce((acc, q) => acc + q.value, 0);

                        return (
                          <li key={salesperson.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="flex items-center gap-2 group/seller">
                              <UserCircle2 className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700">{salesperson.name}</span>
                              <div className="flex gap-1 opacity-0 group-hover/seller:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); setEditUserModal({ isOpen: true, user: salesperson, name: salesperson.name })}}>
                                  <Edit className="w-3 h-3 text-slate-500" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="secondary" className="font-mono">{salespersonQuotes.length}</Badge>
                              <span className="font-semibold text-slate-600 w-24 text-right">{formatCurrency(salespersonTotal)}</span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBranches.length === 0 && (
             <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-slate-500">
               {searchTerm ? 'Nenhuma filial encontrada para a pesquisa.' : 'Nenhuma filial cadastrada. Adicione filiais para começar.'}
             </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={editUserModal.isOpen} onOpenChange={(v) => !v && setEditUserModal({ isOpen: false, user: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Corrija o nome do colaborador selecionado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={editUserModal.name} onChange={(e) => setEditUserModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUserModal({ isOpen: false, user: null, name: '' })}>Cancelar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteUserModal.isOpen} onOpenChange={(v) => !v && setDeleteUserModal({ isOpen: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o usuário <strong className="text-slate-900">{deleteUserModal.user?.name}</strong>. 
              Ao fazer isso, o acesso deste usuário será removido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteUserModal({ isOpen: false, user: null })}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser}>Sim, Excluir Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={editBranchModal.isOpen} onOpenChange={(v) => !v && setEditBranchModal({ isOpen: false, branch: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Filial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome da Filial</Label>
              <Input value={editBranchModal.name} onChange={(e) => setEditBranchModal(m => ({ ...m, name: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditBranchModal({ isOpen: false, branch: null, name: '' })}>Cancelar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};
