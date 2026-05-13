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
  };

  const handleFollowUpWhatsApp = (quote: any) => {
    const productTxt = quote.productInterest ? ` para o(a) *${quote.productInterest}*` : '';
    const msg = `Olá *${quote.clientName}*, tudo bem? 👋\n\nAqui é o(a) *${currentUser.name}* da loja *${myBranch?.name}*.\n\nLembra do nosso orçamento${productTxt} no valor de *${formatCurrency(quote.value)}*?\nComo ele é válido por 2 dias, chegou o momento ideal para finalizarmos sua compra e garantirmos essas condições.\n\nPodemos dar andamento no seu pedido hoje?`;
    window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 opacity-10">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M47.7,-60.2C59.6,-50.3,65.6,-33.5,70.5,-15.8C75.4,1.8,79.2,20.4,72.2,34.4C65.2,48.4,47.4,57.8,29.9,62.8C12.4,67.8,-4.8,68.4,-20.9,64.1C-37.1,59.9,-52.2,50.7,-61.4,36.8C-70.6,22.8,-73.9,4.2,-69,-11.9C-64.2,-28,-51.1,-41.6,-36.8,-51C-22.6,-60.5,-7.2,-65.7,5.5,-72C18.1,-78.4,35.9,-70.1,47.7,-60.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Área de Vendas</h1>
          <p className="text-teal-100 text-lg">Bem-vindo, <strong>{currentUser.name}</strong>. Pronto para fechar negócios?</p>
          {myLegacyBranch && (
            <p className="text-sm bg-black/20 text-white backdrop-blur-md self-start px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mt-3 border border-white/20 shadow-sm">
               <AlertCircle className="w-4 h-4"/> Conta possui modo legado ativo da loja {myLegacyBranch.name}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="new" className="py-2.5">Novo Orçamento Rápido</TabsTrigger>
          <TabsTrigger value="following" className="py-2.5">
            Acompanhamento 
            {quotesNeedingAttention.length > 0 && (
              <Badge className="ml-2 bg-red-500 hover:bg-red-600">{quotesNeedingAttention.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* TAB 1: NEW QUOTE */}
        <TabsContent value="new" className="mt-6">
          <Card className="max-w-3xl border-muted/60 shadow-sm">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-3 text-primary" /> Captura Rápida
              </CardTitle>
              <CardDescription>
                Gere um orçamento para o cliente e envie um comprovante super profissional pelo WhatsApp no mesmo instante.
              </CardDescription>
            </CardHeader>
            <form onSubmit={e => handleSaveQuote(e, false)}>
              <CardContent className="space-y-6 pt-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center"><User className="w-4 h-4 mr-1 text-muted-foreground"/>Nome do Cliente *</Label>
                    <Input placeholder="Nome completo" value={clientName} onChange={e => setClientName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center"><Phone className="w-4 h-4 mr-1 text-muted-foreground"/>WhatsApp *</Label>
                    <Input placeholder="Ex: 11999998888" value={formatPhone(clientPhone)} onChange={handlePhoneChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Produto(s) de Interesse</Label>
                  <Input placeholder="Ex: Guarda-roupa, Cama Casal..." value={productInterest} onChange={e => setProductInterest(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Valor do Orçamento *</Label>
                    <Input placeholder="R$ 0,00" value={quoteValueStr} onChange={handleValueChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center"><CalendarCheck className="w-4 h-4 mr-1 text-muted-foreground"/>Data de Retorno *</Label>
                    <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo (Por que não fechou?) *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as QuoteCategory)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
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
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-muted/20 border-t pt-4">
                <Button variant="outline" type="submit">Apenas Salvar (Sem Avisar)</Button>
                <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={(e) => handleSaveQuote(e, true)}>
                  <Send className="w-4 h-4 mr-2" /> Salvar & Enviar WhatsApp
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: FOLLOW UPS */}
        <TabsContent value="following" className="mt-6">
          <div className="space-y-6">
            
            {quotesNeedingAttention.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                   <h3 className="text-red-800 font-bold flex items-center"><AlertCircle className="w-5 h-5 mr-2"/> Atenção! Retornos Vencidos ou Para Hoje</h3>
                   <p className="text-red-700 text-sm mt-1">Você tem clientes esperando seu contato para fechar negócio.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {pendingQuotes.map(quote => {
                const isOverdue = new Date(quote.returnDate).getTime() <= today.getTime();
                return (
                  <Card key={quote.id} className={`overflow-hidden transition-all hover:border-primary/50 relative ${isOverdue ? 'border-red-300 bg-red-50/10' : ''}`}>
                    {isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                    {!isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>}
                    
                    <CardHeader className="py-4 pb-2 flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{quote.clientName}</CardTitle>
                        <CardDescription>{formatPhone(quote.clientPhone)}</CardDescription>
                      </div>
                      <div className="text-right">
                         <div className="font-bold text-xl text-primary">{formatCurrency(quote.value)}</div>
                         <Badge variant="secondary" className="mt-1 font-mono text-xs text-muted-foreground">{getCategoryLabel(quote.category)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 pb-4">
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <CalendarCheck className="w-4 h-4 mr-2" /> 
                        Retorno Agendado: <strong className={`ml-1 ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>{new Date(quote.returnDate).toLocaleDateString('pt-BR')}</strong>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t py-3 flex justify-between items-center">
                        <Select 
                           value={quote.status} 
                           onValueChange={(val) => updateQuoteStatus(quote.id, val as QuoteStatus)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Aberto / Pendente</SelectItem>
                            <SelectItem value="won" className="text-green-600 font-medium">Venda Concluída!</SelectItem>
                            <SelectItem value="lost" className="text-red-600 font-medium">Venda Perdida</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleFollowUpWhatsApp(quote)}>
                           <Send className="w-3 h-3 mr-2" /> Chamar P/ Retorno
                        </Button>
                    </CardFooter>
                  </Card>
                );
              })}
              
              {pendingQuotes.length === 0 && (
                <div className="text-center py-16 border border-dashed rounded-xl bg-white text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  Nenhum orçamento pendente.<br/>Sua carteira está limpa!
                </div>
              )}
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};
