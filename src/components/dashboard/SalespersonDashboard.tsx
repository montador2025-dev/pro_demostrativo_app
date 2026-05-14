import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput, formatPhone, generateWhatsAppLink } from '../../lib/formatters';
import { Phone, CalendarCheck, FileText, Send, User, ChevronRight, AlertCircle } from 'lucide-react';
import { QuoteCategory, QuoteStatus } from '../../types';
import { toast } from 'sonner';

export const SalespersonDashboard = () => {
  const { currentUser, branches, quotes, addQuote, updateQuoteStatus } = useAppContext();
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [quoteValueStr, setQuoteValueStr] = useState('');
  const [category, setCategory] = useState<QuoteCategory>('researching');
  const [customCategoryReason, setCustomCategoryReason] = useState('');
  const [returnDate, setReturnDate] = useState('');

  if (!currentUser) return null;
  const myBranch = branches.find(b => b.id === currentUser.branchId);
  const myLegacyBranch = branches.find(b => b.id === currentUser.lastBranchId);

  const myQuotes = quotes.filter(q => q.createdBy === currentUser.id);
  
  // Pending and needing attention today or overdue
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const pendingQuotes = myQuotes.filter(q => q.status === 'pending');
  
  const quotesNeedingAttention = pendingQuotes.filter(q => {
    const qDate = new Date(q.returnDate);
    qDate.setHours(0,0,0,0);
    return qDate.getTime() <= today.getTime();
  });

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    setClientPhone(val);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteValueStr(formatCurrencyInput(e.target.value));
  };

  const handleSaveQuote = (e: React.FormEvent, sendToWhatsApp: boolean = false) => {
    e.preventDefault();
    if (!currentUser.branchId) return toast.error('Vendedor sem filial atribuída');
    if (!clientName || !clientPhone || !quoteValueStr || !returnDate) {
      return toast.error('Preencha os campos obrigatórios');
    }

    const valueNum = parseCurrencyInput(quoteValueStr);
    if (valueNum <= 0) return toast.error('Valor inválido');

    // Remove time zone shift bugs by appending time
    const ISOdate = new Date(`${returnDate}T12:00:00Z`).toISOString();

    addQuote({
      clientName,
      clientPhone,
      productInterest,
      value: valueNum,
      category,
      customCategoryReason: category === 'other' ? customCategoryReason : undefined,
      returnDate: ISOdate,
      createdBy: currentUser.id,
      branchId: currentUser.branchId
    });

    toast.success('Orçamento Registrado com Sucesso!');

    if (sendToWhatsApp) {
      const dateStr = new Date(ISOdate).toLocaleDateString('pt-BR');
      const productTxt = productInterest ? `🛍️ Interesse: *${productInterest}*\n` : '';
      const msg = `*==============================*\n*📍 ORÇAMENTO SALVO*\n*==============================*\n\n🧑‍💼 Cliente: *${clientName}*\n🏬 Loja: *${myBranch?.name}*\n👨‍💻 Vendedor: *${currentUser.name}*\n\n${productTxt}💰 Valor Total: *${formatCurrency(valueNum)}*\n⏳ Validade do Orçamento: *2 dias*\n📅 Retorno Agendado: *${dateStr}*\n\nEstamos à disposição para tirar qualquer dúvida!\n*==============================*`;
      window.open(generateWhatsAppLink(clientPhone, msg), '_blank');
    }

    // Reset
    setClientName('');
    setClientPhone('');
    setProductInterest('');
    setQuoteValueStr('');
    setReturnDate('');
    setCategory('researching');
    setCustomCategoryReason('');
  };

  const handleFollowUpWhatsApp = (quote: any) => {
    const productTxt = quote.productInterest ? ` para o(a) *${quote.productInterest}*` : '';
    const msg = `Olá *${quote.clientName}*, tudo bem? 👋\n\nAqui é o(a) *${currentUser.name}* da loja *${myBranch?.name}*.\n\nLembra do nosso orçamento${productTxt} no valor de *${formatCurrency(quote.value)}*?\nComo ele é válido por 2 dias, chegou o momento ideal para finalizarmos sua compra e garantirmos essas condições.\n\nPodemos dar andamento no seu pedido hoje?`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 md:p-8 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 opacity-15">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M47.7,-60.2C59.6,-50.3,65.6,-33.5,70.5,-15.8C75.4,1.8,79.2,20.4,72.2,34.4C65.2,48.4,47.4,57.8,29.9,62.8C12.4,67.8,-4.8,68.4,-20.9,64.1C-37.1,59.9,-52.2,50.7,-61.4,36.8C-70.6,22.8,-73.9,4.2,-69,-11.9C-64.2,-28,-51.1,-41.6,-36.8,-51C-22.6,-60.5,-7.2,-65.7,5.5,-72C18.1,-78.4,35.9,-70.1,47.7,-60.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">Área de Vendas</h1>
          <p className="text-white/90 text-lg font-medium">Bem-vindo, <strong className="text-secondary">{currentUser.name}</strong>. Pronto para fechar negócios?</p>
          {myLegacyBranch && (
            <p className="text-sm bg-black/20 text-white backdrop-blur-md self-start px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mt-3 border border-white/20 shadow-sm font-semibold">
               <AlertCircle className="w-4 h-4"/> Conta possui modo legado ativo da loja {myLegacyBranch.name}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 lg:w-[400px] p-1 bg-slate-100 rounded-xl shadow-inner mb-8">
          <TabsTrigger value="new" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold">
            Novo Orçamento
          </TabsTrigger>
          <TabsTrigger value="following" className="py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-bold">
            Acompanhamento 
            {quotesNeedingAttention.length > 0 && (
              <Badge className="ml-2 bg-rose-500 text-white hover:bg-rose-600 font-bold">{quotesNeedingAttention.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* TAB 1: NEW QUOTE */}
        <TabsContent value="new" className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="max-w-3xl border-primary/10 shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10 pb-5">
              <CardTitle className="flex items-center text-xl text-primary font-bold">
                <FileText className="w-6 h-6 mr-3 text-secondary" /> Captura Rápida
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Gere um orçamento para o cliente e envie um comprovante super profissional pelo WhatsApp no mesmo instante.
              </CardDescription>
            </CardHeader>
            <form onSubmit={e => handleSaveQuote(e, false)}>
              <CardContent className="space-y-6 pt-6 px-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="flex items-center text-slate-700 font-medium"><User className="w-4 h-4 mr-1.5 text-primary"/>Nome do Cliente *</Label>
                    <Input className="border-slate-200 focus-visible:ring-secondary bg-slate-50/50" placeholder="Nome completo" value={clientName} onChange={e => setClientName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center text-slate-700 font-medium"><Phone className="w-4 h-4 mr-1.5 text-emerald-500"/>WhatsApp *</Label>
                    <Input className="border-slate-200 focus-visible:ring-secondary bg-slate-50/50" placeholder="Ex: 11999998888" value={formatPhone(clientPhone)} onChange={handlePhoneChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Produto(s) de Interesse</Label>
                  <Input className="border-slate-200 focus-visible:ring-secondary bg-slate-50/50" placeholder="Ex: Guarda-roupa, Cama Casal..." value={productInterest} onChange={e => setProductInterest(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Valor do Orçamento *</Label>
                    <Input className="border-slate-200 focus-visible:ring-secondary bg-slate-50/50 font-semibold text-slate-900" placeholder="R$ 0,00" value={quoteValueStr} onChange={handleValueChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center text-slate-700 font-medium"><CalendarCheck className="w-4 h-4 mr-1.5 text-secondary"/>Data de Retorno *</Label>
                    <Input className="border-slate-200 focus-visible:ring-secondary bg-slate-50/50" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Motivo (Por que não fechou?) *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as QuoteCategory)}>
                      <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:ring-secondary"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card_turning">Cartão a Virar</SelectItem>
                        <SelectItem value="researching">Só Pesquisando</SelectItem>
                        <SelectItem value="price_high">Achou Caro</SelectItem>
                        <SelectItem value="needs_spouse">Decisão Compartilhada</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {category === 'other' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="flex items-center text-slate-700 font-medium italic">Especifique o Motivo *</Label>
                    <Input 
                      className="border-slate-200 focus-visible:ring-secondary bg-white font-bold" 
                      placeholder="Descreva por que a venda não foi concluída..." 
                      value={customCategoryReason} 
                      onChange={e => setCustomCategoryReason(e.target.value)} 
                      required 
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 bg-slate-50 border-t border-slate-100 py-5 px-6">
                <Button variant="outline" type="submit" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-medium">Apenas Salvar (Sem Avisar)</Button>
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-medium" onClick={(e) => handleSaveQuote(e, true)}>
                  <Send className="w-4 h-4 mr-2" /> Salvar & Enviar WhatsApp
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: FOLLOW UPS */}
        <TabsContent value="following" className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            
            {quotesNeedingAttention.length > 0 && (
              <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-xl p-5 shadow-lg shadow-red-500/20 flex flex-col md:flex-row md:items-center justify-between text-white overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <AlertCircle className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-bold flex items-center mb-1"><AlertCircle className="w-6 h-6 mr-2 animate-pulse text-white"/> Retornos Vencidos ou Para Hoje!</h3>
                   <p className="text-rose-100">Existem {quotesNeedingAttention.length} cliente(s) esperando seu contato. Um bom retorno garante a venda.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingQuotes.map(quote => {
                const isOverdue = new Date(quote.returnDate).getTime() <= today.getTime();
                return (
                  <Card key={quote.id} className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative border ${isOverdue ? 'border-rose-200 shadow-rose-100 bg-white' : 'border-primary/20 bg-white shadow-primary/5 hover:border-primary/40'}`}>
                    {isOverdue && <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-red-600 shadow-[0_0_10px_rgba(225,29,72,0.4)]"></div>}
                    {!isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 to-primary"></div>}
                    
                    <CardHeader className="py-5 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1" title={quote.clientName}>{quote.clientName}</CardTitle>
                          <CardDescription className="text-slate-500 flex items-center font-medium mt-1">
                            {formatPhone(quote.clientPhone)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={`ml-2 whitespace-nowrap text-xs font-semibold ${isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-primary/5 text-primary border-primary/20'}`}>
                           {isOverdue ? 'Retornar Hoje' : 'Aberto'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                        <div className="font-black text-xl text-primary">{formatCurrency(quote.value)}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {quote.category === 'other' && quote.customCategoryReason ? quote.customCategoryReason : getCategoryLabel(quote.category)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 pb-5">
                      {quote.productInterest && (
                         <div className="flex items-center text-sm text-slate-600 font-medium mb-3">
                           <span className="w-2 h-2 rounded-full bg-secondary mr-2 shadow-sm shadow-secondary/50"></span>
                           {quote.productInterest}
                         </div>
                      )}
                      <div className="flex items-center text-sm font-medium bg-slate-100/60 p-2 rounded-md">
                        <CalendarCheck className={`w-4 h-4 mr-2 ${isOverdue ? 'text-rose-500' : 'text-primary'}`} /> 
                        <span className="text-slate-500 mr-1">Agendado:</span> 
                        <span className={`${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}`}>{new Date(quote.returnDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </CardContent>
                    <CardFooter className={`border-t py-4 gap-2 flex-col items-stretch ${isOverdue ? 'bg-rose-50/50' : 'bg-slate-50/50'}`}>
                        <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-[#25D366]/20 font-semibold" onClick={() => handleFollowUpWhatsApp(quote)}>
                           <Send className="w-4 h-4 mr-2" /> Chamar WhatsApp
                        </Button>
                        <Select 
                           value={quote.status} 
                           onValueChange={(val) => updateQuoteStatus(quote.id, val as QuoteStatus)}
                        >
                          <SelectTrigger className="w-full text-slate-600 bg-white border-slate-200">
                            <SelectValue placeholder="Atualizar Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Aberto / Pendente</SelectItem>
                            <SelectItem value="won" className="text-emerald-600 font-bold">🎉 Venda Concluída!</SelectItem>
                            <SelectItem value="lost" className="text-rose-600 font-semibold">❌ Venda Perdida</SelectItem>
                          </SelectContent>
                        </Select>
                    </CardFooter>
                  </Card>
                );
              })}
              
              {pendingQuotes.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-slate-500">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <FileText className="w-10 h-10 text-primary/30" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum orçamento pendente.</h3>
                  <p>Sua carteira de clientes está limpa!</p>
                </div>
              )}
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};
