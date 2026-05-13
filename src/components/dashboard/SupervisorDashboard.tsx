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

      {/* DETAILED BRANCH DIALOG */}
      <Dialog open={!!branchDetailsId} onOpenChange={(open) => !open && setBranchDetailsId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600" />
              {detailedBranch?.name}
            </DialogTitle>
            <DialogDescription>
              Visão detalhada de resultados, vendedores e todos os orçamentos processados nesta loja.
            </DialogDescription>
          </DialogHeader>

          {detailedBranch && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-50 border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Gerente Responsável</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold text-lg">{detailedBranch.manager?.name || 'Não atribuído'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Orçamentos Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold text-lg">{detailedBranch.quotesCount}</div>
                  </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-indigo-700">Ticket Potencial Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-xl text-indigo-700">{formatCurrency(detailedBranch.totalValue)}</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="vendedores" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vendedores">Equipe de Vendas</TabsTrigger>
                  <TabsTrigger value="orcamentos">Histórico de Orçamentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vendedores" className="mt-4">
                  <Card className="border-slate-200">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                          <TableHead className="text-right">Montante Gerado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedBranch.salespeople.map(s => {
                          const sQuotes = detailedBranchQuotes.filter(q => q.createdBy === s.id);
                          const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium flex items-center gap-2">
                                <UserCircle2 className="w-4 h-4 text-slate-400" />
                                {s.name}
                              </TableCell>
                              <TableCell className="text-right"><Badge variant="secondary">{sQuotes.length}</Badge></TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(sTotal)}</TableCell>
                            </TableRow>
                          );
                        })}
                        {detailedBranch.salespeople.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-500 py-6">Nenhum vendedor registrado.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="orcamentos" className="mt-4">
                  <Card className="border-slate-200">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Cliente & Produto</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Retorno</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedBranchQuotes.map(q => {
                          const qSeller = users.find(u => u.id === q.createdBy);
                          return (
                            <TableRow key={q.id}>
                              <TableCell>
                                <div className="font-medium">{q.clientName}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <FileText className="w-3 h-3" /> {q.productInterest || 'Não especificado'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">{q.clientPhone}</div>
                                <a href={`https://wa.me/${q.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 mt-0.5">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                  WhatsApp
                                </a>
                              </TableCell>
                              <TableCell className="text-sm">{qSeller?.name}</TableCell>
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
                          )
                        })}
                        {detailedBranchQuotes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-500 py-6">Nenhum orçamento registrado.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
