import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency, formatPhone } from '../../lib/formatters';
import { Phone, CalendarCheck, FileText, Send, User, MoreHorizontal, MessageSquare, Plus } from 'lucide-react';
import { Quote, QuoteStatus } from '../../types';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface KanbanColumnProps {
  title: string;
  color: string;
  quotes: Quote[];
  onStatusChange?: (quoteId: string, newStatus: QuoteStatus) => void;
  onCardClick?: (quote: Quote) => void;
  onWhatsAppClick?: (quote: Quote) => void;
}

const KanbanCard: React.FC<{ 
  quote: Quote, 
  onWhatsAppClick?: (quote: Quote) => void,
  onClick?: (quote: Quote) => void 
}> = ({ quote, onWhatsAppClick, onClick }) => {
  const isOverdue = quote.status === 'pending' && new Date(quote.returnDate).getTime() <= new Date().setHours(0,0,0,0);

  return (
    <div 
      onClick={() => onClick?.(quote)}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group mb-3"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
           <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{quote.clientName}</h4>
           <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
             <FileText className="w-3 h-3 text-emerald-500" />
             {quote.productInterest || 'Interesse não especificado'}
           </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-slate-600">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        <div className="text-lg font-black text-slate-900 tracking-tighter">
          {formatCurrency(quote.value)}
        </div>
      </div>

      {isOverdue && (
        <div className="mb-4 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2">
           <CalendarCheck className="w-3.5 h-3.5" /> RETORNO HOJE
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
             {quote.clientName.charAt(0)}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onWhatsAppClick?.(quote); }}
            className="p-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
             <MessageSquare className="w-3 h-3" /> 2
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, color, quotes, onWhatsAppClick, onCardClick }) => {
  const totalValue = quotes.reduce((acc, q) => acc + q.value, 0);

  return (
    <div className="flex flex-col w-[320px] shrink-0 h-full max-h-full overflow-hidden">
      <div className={cn("px-4 py-3 border-t-4 border-b border-l border-r border-slate-200 rounded-t-xl bg-white shadow-sm flex flex-col gap-1", color)}>
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
             {title}
             <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-md font-black">{quotes.length}</span>
          </h3>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
             <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
           Vol: <span className="text-slate-600">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 pr-1 custom-scrollbar space-y-1 pb-10">
        {quotes.map(q => (
          <KanbanCard 
            key={q.id} 
            quote={q} 
            onWhatsAppClick={onWhatsAppClick}
            onClick={onCardClick}
          />
        ))}
        {quotes.length === 0 && (
          <div className="py-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 opacity-30 italic text-slate-400 scale-95">
             <FileText className="w-10 h-10" />
             <span className="text-xs font-bold uppercase tracking-widest">Vazio</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<{
  quotes: Quote[],
  onWhatsAppClick?: (quote: Quote) => void,
  onCardClick?: (quote: Quote) => void
}> = ({ quotes, onWhatsAppClick, onCardClick }) => {
  
  const columns = [
    { title: 'CONTATOS / NOVOS', color: 'border-t-blue-500', items: quotes.filter(q => q.status === 'pending') },
    { title: 'GANHOS', color: 'border-t-emerald-500', items: quotes.filter(q => q.status === 'won') },
    { title: 'PERDIDOS', color: 'border-t-rose-500', items: quotes.filter(q => q.status === 'lost') },
  ];

  return (
    <div className="flex gap-6 h-full pb-6 overflow-x-auto select-none no-scrollbar">
      {columns.map((col, idx) => (
        <KanbanColumn 
          key={idx}
          title={col.title}
          color={col.color}
          quotes={col.items}
          onWhatsAppClick={onWhatsAppClick}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};
