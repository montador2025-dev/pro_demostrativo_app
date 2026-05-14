import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { formatCurrency, generateWhatsAppLink, formatPhone } from '../../lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { PlusCircle, Search, Calendar, FileText, Send, Phone, Edit, Trash2, CheckCircle2, XCircle, LayoutDashboard, ListFilter, ClipboardList, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Quote, QuoteStatus } from '../../types';
import { toast } from 'sonner';
import { KanbanBoard } from './KanbanBoard';
import { cn } from '../../lib/utils';

export const SalespersonDashboard = () => {
  const { currentUser, quotes, addQuote, updateQuote, deleteQuote } = useAppContext();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quote Form State
  const [quoteFormData, setQuoteFormData] = useState({
    clientName: '',
    clientPhone: '',
    value: '',
    productInterest: '',
    returnDate: new Date().toISOString().split('T')[0]
  });

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const myQuotes = quotes.filter(q => q.createdBy === currentUser?.id && !q.isTransferred);
  const filteredQuotes = myQuotes.filter(q => 
    q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.productInterest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.branchId) return;
    
    addQuote({
      clientName: quoteFormData.clientName,
      clientPhone: quoteFormData.clientPhone,
      value: Number(quoteFormData.value),
      productInterest: quoteFormData.productInterest,
      returnDate: quoteFormData.returnDate,
      branchId: currentUser.branchId,
      createdBy: currentUser.id,
      status: 'pending'
    });

    setQuoteFormData({
      clientName: '',
      clientPhone: '',
      value: '',
      productInterest: '',
      returnDate: new Date().toISOString().split('T')[0]
    });
    setIsQuoteOpen(false);
    toast.success('Orçamento criado!');
  };

  const handleUpdateStatus = (id: string, status: QuoteStatus) => {
    updateQuote(id, { status });
    toast.success(`Status atualizado para ${status === 'won' ? 'Ganho' : 'Perdido'}`);
    setIsDetailsOpen(false);
  };

  const handleWhatsAppAction = (quote: Quote) => {
    const msg = `Olá *${quote.clientName}*, aqui é o *${currentUser?.name}*. Fiquei de te dar um retorno sobre o orçamento de *${formatCurrency(quote.value)}*. Podemos conversar?`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  const totalPendingValue = myQuotes.filter(q => q.status === 'pending').reduce((acc, q) => acc + q.value, 0);
  const totalWonValue = myQuotes.filter(q => q.status === 'won').reduce((acc, q) => acc + q.value, 0);
  const wonCount = myQuotes.filter(q => q.status === 'won').length;
  const totalCount = myQuotes.length;
  const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Mini Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <TrendingUp className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vendas (Ganhas)</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{formatCurrency(totalWonValue)}</div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <ClipboardList className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Propostas Ativas</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{myQuotes.filter(q => q.status === 'pending').length}</div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
               <Calendar className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Taxa de Conversão</div>
               <div className="text-lg font-black text-slate-800 tabular-nums">{conversionRate}%</div>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm bg-emerald-600 text-white rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
               <PlusCircle className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black opacity-70 uppercase tracking-widest leading-none mb-1">Meta Mensal</div>
               <div className="text-lg font-black tabular-nums">75%</div>
            </div>
         </Card>
      </div>

      {/* Search & Tool Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 h-10 shadow-sm w-full md:w-80 focus-within:border-emerald-500 transition-all">
             <Search className="w-4 h-4 text-slate-300 mr-2" />
             <input 
               type="text" 
               placeholder="Pesquisar orçamento..." 
               className="bg-transparent border-none text-sm font-medium w-full outline-none text-slate-700 placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="hidden md:flex items-center gap-2 px-4 border-l border-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                 Pendente: <span className="text-slate-800">{formatCurrency(totalPendingValue)}</span>
              </span>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 h-11 font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-all" onClick={() => setIsQuoteOpen(true)}>
             <PlusCircle className="w-5 h-5 mr-2" /> NOVO ORÇAMENTO
           </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        <KanbanBoard 
          quotes={filteredQuotes} 
          onWhatsAppClick={handleWhatsAppAction}
          onCardClick={(q) => { setSelectedQuote(q); setIsDetailsOpen(true); }}
        />
      </div>

      {/* New Quote Modal */}
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-emerald-600 p-8 text-white">
             <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
                <PlusCircle className="w-6 h-6" /> Capturar Lead
             </h2>
             <p className="text-emerald-100 font-medium">Cadastre os dados iniciais do novo orçamento.</p>
          </div>
          <form onSubmit={handleAddQuote} className="p-8 space-y-5 bg-white">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Cliente</Label>
                <Input 
                   autoFocus
                   placeholder="Nome completo" 
                   value={quoteFormData.clientName} 
                   className="rounded-xl border-slate-200 h-11 font-bold"
                   onChange={e => setQuoteFormData({...quoteFormData, clientName: e.target.value})} 
                   required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp</Label>
                <Input 
                   type="tel" 
                   placeholder="(00) 00000-0000" 
                   value={quoteFormData.clientPhone} 
                   className="rounded-xl border-slate-200 h-11 font-bold font-mono"
                   onChange={e => setQuoteFormData({...quoteFormData, clientPhone: e.target.value})} 
                   required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor R$</Label>
                   <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={quoteFormData.value} 
                      className="rounded-xl border-slate-200 h-11 font-black"
                      onChange={e => setQuoteFormData({...quoteFormData, value: e.target.value})} 
                      required 
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Agendar Retorno</Label>
                   <Input 
                      type="date" 
                      value={quoteFormData.returnDate} 
                      className="rounded-xl border-slate-200 h-11 font-bold"
                      onChange={e => setQuoteFormData({...quoteFormData, returnDate: e.target.value})} 
                      required 
                   />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Interesse / Produto</Label>
                <Textarea 
                   placeholder="Ex: Cama box queen, jogo de lençol..." 
                   value={quoteFormData.productInterest} 
                   className="rounded-xl border-slate-200 min-h-[80px] font-medium"
                   onChange={e => setQuoteFormData({...quoteFormData, productInterest: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-emerald-600 h-12 rounded-xl font-black text-white shadow-xl shadow-emerald-500/10">CADASTRAR ORÇAMENTO</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          {selectedQuote && (
            <div className="flex flex-col h-full bg-white">
               <div className="bg-slate-900 p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                     <ClipboardList className="w-24 h-24 rotate-12" />
                  </div>
                  <div className="flex flex-col gap-2 relative z-10">
                     <Badge className="w-fit bg-emerald-500 font-black px-3 py-1 mb-2">OPORTUNIDADE</Badge>
                     <h2 className="text-3xl font-black tracking-tighter leading-none">{selectedQuote.clientName}</h2>
                     <p className="text-slate-400 font-bold flex items-center gap-1.5">
                       <FileText className="w-4 h-4 text-emerald-500" />
                       # {selectedQuote.id.slice(-6).toUpperCase()}
                     </p>
                  </div>
               </div>

               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Valor da Proposta</div>
                        <div className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(selectedQuote.value)}</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp</div>
                        <div className="text-xl font-black text-slate-800 font-mono tracking-tight">{formatPhone(selectedQuote.clientPhone)}</div>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Agenda de Retorno
                     </div>
                     <div className="text-lg font-black text-slate-700">
                        {new Date(selectedQuote.returnDate).toLocaleDateString('pt-BR', { dateStyle: 'full' })}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mudar Status para:</div>
                     <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => handleUpdateStatus(selectedQuote.id, 'won')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 font-black shadow-lg shadow-emerald-500/10"
                        >
                           <CheckCircle2 className="w-4 h-4 mr-2" /> GANHOU
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(selectedQuote.id, 'lost')}
                          className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-11 font-black shadow-lg shadow-rose-500/10"
                        >
                           <XCircle className="w-4 h-4 mr-2" /> PERDEU
                        </Button>
                     </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 mt-4"
                    onClick={() => handleWhatsAppAction(selectedQuote)}
                  >
                     <Send className="w-5 h-5 mr-3" /> FALAR NO WHATSAPP
                  </Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
