import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatCurrency } from '../../lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Users, Shuffle, UserMinus, AlertCircle, TrendingUp, Search, Eye, FileText, CalendarCheck, Edit, Trash2 } from 'lucide-react';
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
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {myBranch?.name}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Painel do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Gerente</span></h1>
              <p className="text-slate-500 mt-2">Gerencie sua equipe, corrija cadastros e acompanhe as conversões da sua loja.</p>
            </div>
            <Dialog open={isSalespersonOpen} onOpenChange={setIsSalespersonOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"><Users className="w-4 h-4 mr-2" /> Novo Vendedor</Button>
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
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Cadastrar Vendedor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vendedores Ativos</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-800">{mySalespeople.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Orçamentos Ativos (Filial)</CardTitle>
            <FileText className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-800">{myBranchQuotes.length}</div></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Potencial de Venda</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-blue-200 mt-1">Soma base de todos vendedores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Equipe Comercial</CardTitle>
                <CardDescription>Resumo de orçamentos e performance da sua equipe.</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  placeholder="Buscar vendedor..." 
                  className="pl-9 bg-slate-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Orçamentos</TableHead>
                  <TableHead className="text-right">Montante Promissor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalespeople.map(s => {
                  const sQuotes = myBranchQuotes.filter(q => q.createdBy === s.id && !q.isTransferred);
                  const sTotal = sQuotes.reduce((acc, q) => acc + q.value, 0);
                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-800">{s.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">{sQuotes.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        {formatCurrency(sTotal)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100" title="Editar Nome" onClick={() => setEditUserModal({ isOpen: true, user: s, name: s.name })}>
                          <Edit className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50" title="Ver Detalhes do Vendedor" onClick={() => setSellerDetailsId(s.id)}>
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
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground border-dashed">
                      {searchTerm ? 'Nenhum vendedor encontrado.' : 'Sua equipe ainda não possui vendedores.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Gestão de Crise
            </CardTitle>
            <CardDescription className="text-amber-700/80">Ações estratégicas da filial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-900/80 leading-relaxed">
               Na saída ou transferência de um vendedor, repasse a carteira de orçamentos pendentes para outro consultor. Os orçamentos fechados na sua filial permanecerão nos seus relatórios de conversão para manter o histórico íntegro.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seller Details Dialog */}
      <Dialog open={!!sellerDetailsId} onOpenChange={(open) => !open && setSellerDetailsId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
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
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm text-blue-700">Potencial na Mão do Vendedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-2xl text-blue-700">{formatCurrency(detailedSellerTotal)}</div>
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
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</Button>
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
