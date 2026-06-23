import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext, formatLocalDate } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput, formatPhone, generateWhatsAppLink } from '../../lib/formatters';
import { 
  Phone, 
  Send, 
  User, 
  ChevronRight, 
  AlertCircle, 
  Zap, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  FileDown, 
  HelpCircle, 
  CheckCircle, 
  Calendar, 
  Clock, 
  BookOpen, 
  Info, 
  Check,
  ChevronDown,
  ChevronUp,
  Calculator,
  Target,
  Award,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Copy,
  PlusCircle,
  X,
  Bell,
  Volume2,
  VolumeX,
  UserCircle2,
  Truck,
  Wrench
} from 'lucide-react';
import { QuoteCategory, QuoteStatus, Product, QuoteItem } from '../../types';
import { productCatalog, searchProducts, getRawCatalogBySegment } from '../../data/catalog';
import { generateProfessionalQuotePDF } from '../../lib/pdfGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// SaaS Premium Elegant Analytics Sparkline Graph for Salesperson
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

const fetchCatalogWithRunFallback = async (site: string, query: string): Promise<any> => {
  const localUrl = `/api/catalog?site=${encodeURIComponent(site)}&query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(localUrl);
    if (!response.ok) {
      throw new Error(`HTTP status error: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[Catalog Scraper] Local fetch failed or returned invalid response, trying Cloud Run fallback:', err);
    try {
      const fallbackBase = "https://ais-pre-wilpbwh5ci77agpanmlcw7-273210465927.us-east5.run.app";
      const fallbackUrl = `${fallbackBase}/api/catalog?site=${encodeURIComponent(site)}&query=${encodeURIComponent(query)}`;
      const response = await fetch(fallbackUrl);
      if (!response.ok) {
        throw new Error(`Fallback HTTP status error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (fallbackErr: any) {
      console.error('[Catalog Scraper] Both local and fallback fetch failed:', fallbackErr);
      throw fallbackErr;
    }
  }
};

const CartItemPriceInput = ({ item, onUpdatePrice }: { item: any, onUpdatePrice: (productId: string, price: number) => void }) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sync from props if not focused
  useEffect(() => {
    if (!isFocused) {
      if (item.price > 0) {
        setLocalValue(item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } else {
        setLocalValue('');
      }
    }
  }, [item.price, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Clean and capture only digits
    const digits = rawVal.replace(/\D/g, '');
    if (!digits) {
      setLocalValue('');
      onUpdatePrice(item.productId, 0);
      return;
    }

    const numericPrice = parseInt(digits, 10) / 100;
    const formatted = numericPrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    setLocalValue(formatted);
    onUpdatePrice(item.productId, numericPrice);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (item.price > 0) {
      setLocalValue(item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setLocalValue('');
    }
    setTimeout(() => {
      e.target.select();
    }, 50);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (item.price > 0) {
      setLocalValue(item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setLocalValue('');
    }
  };

  return (
    <input 
      type="text" 
      aria-label={`Preço para ${item.nickname}`}
      placeholder="0,00"
      className="w-24 h-6 px-1.5 text-[11px] font-black text-amber-700 bg-stone-100 hover:bg-stone-200 focus:bg-white border border-stone-300 focus:border-amber-700 outline-none transition-all rounded text-center shadow-xs"
      value={localValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export const SalespersonDashboard = () => {
  const { currentUser, branches, quotes, addQuote, updateQuoteStatus, activeTab, setActiveTab } = useAppContext();
  
  // Base Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [quoteValueStr, setQuoteValueStr] = useState('');
  const [category, setCategory] = useState<QuoteCategory>('researching');
  const [customCategoryReason, setCustomCategoryReason] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  // Freight and Assembly parameters
  const [shippingFeeStr, setShippingFeeStr] = useState<string>('0,00');
  const [isAssemblyFree, setIsAssemblyFree] = useState<boolean>(true);
  const [assemblyFeeStr, setAssemblyFeeStr] = useState<string>('0,00');
  
  // Upgraded Architecture State
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [observations, setObservations] = useState('');
  const [validityDays, setValidityDays] = useState<number>(5);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalogCategory, setActiveCatalogCategory] = useState('Todos');
  const [expandedProductSpecs, setExpandedProductSpecs] = useState<Record<string, boolean>>({});
  const [isQuoteInitializing, setIsQuoteInitializing] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [showStatusLegend, setShowStatusLegend] = useState(true);
  const [playedReminderIds, setPlayedReminderIds] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Dynamic Segment Selector & Custom Category Form State Hooks
  const [activeSegment, setActiveSegment] = useState<'furniture' | 'clothing' | 'shoes' | 'perfume'>('furniture');
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemCode, setCustomItemCode] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  
  // Segment-specific manual specifications
  const [customSize, setCustomSize] = useState('M');
  const [customColor, setCustomColor] = useState('');
  const [customMaterial, setCustomMaterial] = useState('');
  const [customVolume, setCustomVolume] = useState('100ml');
  const [customBrand, setCustomBrand] = useState('O Boticário');

  // MÓDULO 1 & 2: API UNIVERSAL DE CATÁLOGO & BUSCA INTELIGENTE
  const [catalogSearchMode, setCatalogSearchMode] = useState<'local' | 'online'>('online');
  const [onlineCatalogUrl, setOnlineCatalogUrl] = useState('www.sonoshowmoveis.com.br');
  const [isOnlineCatalogSearching, setIsOnlineCatalogSearching] = useState(false);
  const [onlineProducts, setOnlineProducts] = useState<any[]>([]);
  const [onlineError, setOnlineError] = useState('');

  // Auto query with debounce (runs automatically ONLY for official Sono Show catalog to prevent flood crashes on custom sites while typing)
  useEffect(() => {
    if (catalogSearchMode !== 'online' || !catalogSearch.trim()) {
      setOnlineProducts([]);
      return;
    }

    // Protect custom e-commerce URLs from keystroke-level floods
    if (onlineCatalogUrl !== 'www.sonoshowmoveis.com.br' && onlineCatalogUrl !== 'catalogo.sonoshowmoveis.com.br') {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsOnlineCatalogSearching(true);
      setOnlineError('');
      try {
        const data = await fetchCatalogWithRunFallback(onlineCatalogUrl, catalogSearch);
        if (data.success && Array.isArray(data.products)) {
          setOnlineProducts(data.products);
        } else {
          setOnlineError(data.error || 'Nenhum item detectado nesta URL.');
        }
      } catch (err) {
        setOnlineError('Incapaz de conectar com o serviço de Catálogo Radar.');
      } finally {
        setIsOnlineCatalogSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [catalogSearch, catalogSearchMode, onlineCatalogUrl]);

  // Map online product listings on the fly to fulfill type alignments securely
  const mappedOnlineProducts = useMemo(() => {
    if (!Array.isArray(onlineProducts)) return [];
    return onlineProducts
      .filter(p => p && typeof p === 'object')
      .map((p, index) => {
        const pSku = p.sku || `ON-${index}`;
        const pName = p.name || 'Produto sem nome';
        const nickname = typeof pName === 'string' ? pName.split(' ').slice(0, 3).join(' ') : 'Produto...';
        const id = `online-${pSku}-${index}`;
        return {
          id,
          code: pSku,
          name: pName,
          nickname,
          description: p.description || 'Produto importado via Radar Comercial.',
          specifications: `Plataforma: ${p.category || 'E-commerce'} | SKU: ${pSku} | Fonte: ${onlineCatalogUrl}`,
          imageUrl: p.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
          category: p.category || 'Geral',
          price: Number(p.price) || 0
        };
      });
  }, [onlineProducts, onlineCatalogUrl]);

  useEffect(() => {
    if (activeTab === 'new_quote') {
      setIsQuoteInitializing(true);
      const timer = setTimeout(() => {
        setIsQuoteInitializing(false);
      }, 550); // Fluid, tactile simulation loading delay
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Payment Simulator State
  const [customSimulatedAmount, setCustomSimulatedAmount] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(10);
  const [interestType, setInterestType] = useState<'no_interest' | 'with_interest'>('no_interest');
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<number>(1.99);

  // Mechanical Tactility Animation Settings
  const clickHighlight = {
    whileTap: { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 15 } },
    whileHover: { scale: 1.01, transition: { duration: 0.1 } }
  };

  if (!currentUser) return null;
  const myBranch = branches.find(b => b.id === currentUser.branchId);
  const myLegacyBranch = branches.find(b => b.id === currentUser.lastBranchId);
  
  const myQuotes = useMemo(() => {
    return quotes.filter(q => q.createdBy === currentUser.id);
  }, [quotes, currentUser.id]);

  const displayedQuotes = useMemo(() => {
    if (selectedStatusFilter === 'all') return myQuotes;
    return myQuotes.filter(q => q.status === selectedStatusFilter);
  }, [myQuotes, selectedStatusFilter]);
  
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);

  const handleExportCSV = () => {
    if (displayedQuotes.length === 0) {
      toast.error("Nenhum orçamento exibido encontrado para exportar.");
      return;
    }

    try {
      // Tradutores amigáveis para português nos campos do CSV
      const translateCategory = (cat: string) => {
        switch (cat) {
          case 'researching': return 'Só Pesquisando Preço';
          case 'card_turning': return 'Aguardando Virada de Cartão';
          case 'price_high': return 'Achou o Valor Alto';
          case 'needs_spouse': return 'Pendente Validação Cônjuge';
          case 'other': return 'Outros Motivos Especial';
          default: return cat || '';
        }
      };

      const translateStatus = (stat: string) => {
        switch (stat) {
          case 'won': return 'Ganho (Venda Realizada)';
          case 'lost': return 'Perdido (Desistência)';
          case 'pending': return 'Negociação Ativa (Aberto)';
          default: return stat || '';
        }
      };

      const headers = [
        "ID do Atendimento",
        "Cliente",
        "Telefone",
        "Interesse Principal",
        "Valor Total (R$)",
        "Diagnóstico",
        "Data Retorno / Follow-up",
        "Status",
        "Dias de Validade",
        "Itens (Qtd)",
        "Lista de Itens",
        "Observações",
        "Data de Criação"
      ];

      const rows = displayedQuotes.map(quote => {
        const valueFormatted = quote.value ? quote.value.toFixed(2).replace('.', ',') : '0,00';
        const itemsCount = quote.items ? quote.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
        const itemsList = quote.items
          ? quote.items.map(item => `${item.name} (${item.code}) x${item.quantity}`).join(' | ')
          : '';
        const createdDateFormatted = formatLocalDate(quote.createdAt);
        const returnDateFormatted = formatLocalDate(quote.returnDate);

        return [
          quote.id,
          quote.clientName || '',
          quote.clientPhone || '',
          quote.productInterest || '',
          valueFormatted,
          translateCategory(quote.category),
          returnDateFormatted,
          translateStatus(quote.status),
          quote.validityDays?.toString() || '',
          itemsCount.toString(),
          itemsList,
          quote.notes || '',
          createdDateFormatted
        ];
      });

      // Join row fields using semicolon (ideal for Excel defaulting to Latin locale) and properly escape
      const csvContent = [
        headers.join(';'),
        ...rows.map(fields => fields.map(field => {
          const cleanField = String(field).replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');
          return `"${cleanField}"`;
        }).join(';'))
      ].join('\r\n');

      // Add UTF-8 BOM to survive Excel encoding issues with accents like 'ç' and 'ã' (\uFEFF)
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fileName = `SonoShow_Orcamentos_${currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Orçamentos exportados com sucesso! (${displayedQuotes.length} registros)`);
    } catch {
      toast.error("Ocorreu um erro ao gerar o arquivo CSV.");
    }
  };
  
  const pendingQuotes = useMemo(() => {
    return myQuotes.filter(q => q.status === 'pending');
  }, [myQuotes]);

  const wonQuotes = useMemo(() => {
    return myQuotes.filter(q => q.status === 'won');
  }, [myQuotes]);

  const lostQuotes = useMemo(() => {
    return myQuotes.filter(q => q.status === 'lost');
  }, [myQuotes]);

  const targetValidityDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + validityDays);
    return d.toLocaleDateString('pt-BR');
  }, [validityDays]);
  
  const quotesNeedingAttention = useMemo(() => {
    return pendingQuotes.filter(q => {
      const qDate = new Date(q.returnDate);
      qDate.setHours(0,0,0,0);
      return qDate.getTime() <= today.getTime();
    });
  }, [pendingQuotes, today]);

  // Automatic Audio Reminder Alert System for pending quotes close to returnDate (today or tomorrow)
  const quotesNearReturn = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // today or tomorrow (return warning)
    
    return pendingQuotes.filter(q => {
      if (!q.returnDate) return false;
      const qDate = new Date(q.returnDate);
      qDate.setHours(0,0,0,0);
      return qDate.getTime() <= tomorrow.getTime();
    });
  }, [pendingQuotes, today]);

  // Web Audio API Synthesizer (double C5-E5 chime) for 100% offline-compatible sound notice
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Note 1: C5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: E5
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch (err) {
      console.warn("Autoplay restriction by user browser configuration prevented sound from playing:", err);
    }
  };

  useEffect(() => {
    if (quotesNearReturn.length === 0) return;
    
    // Filter ones that haven't been alerted with chime sound in active session
    const unplayed = quotesNearReturn.filter(q => !playedReminderIds.includes(q.id));
    if (unplayed.length > 0) {
      // Trigger chime
      playNotificationChime();
      
      // Keep track to prevent repeat loops
      setPlayedReminderIds(prev => [
        ...prev,
        ...unplayed.map(q => q.id)
      ]);
      
      // Toast notification
      if (unplayed.length === 1) {
        toast.info(`🔔 Lembrete de Retorno: Fazer contato com ${unplayed[0].clientName}!`, {
          description: `Interesse: "${unplayed[0].productInterest}"`,
          action: {
            label: 'Ver Cliente',
            onClick: () => setActiveTab('followup')
          },
          duration: 7000
        });
      } else {
        toast.info(`🔔 Você tem ${unplayed.length} propostas pendentes precisando de retorno hoje ou amanhã!`, {
          action: {
            label: 'Fazer Follow-ups',
            onClick: () => setActiveTab('followup')
          },
          duration: 7000
        });
      }
    }
  }, [quotesNearReturn, playedReminderIds]);

  // Calculate won volume & gamified targets
  const wonSalesTotal = wonQuotes.reduce((acc, q) => acc + q.value, 0);
  const salesGoal = 35000; // Monthly benchmark salesperson goal in R$
  const goalPercentage = Math.round(Math.min((wonSalesTotal / salesGoal) * 100, 100));

  // Determine achievement badge
  const getBadgeTier = (sales: number) => {
    if (sales >= 35000) return { title: 'Diamante Showroom', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    if (sales >= 20000) return { title: 'Selo Ouro Sono', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (sales >= 10000) return { title: 'Consultor Prata', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    return { title: 'Iniciante Ativo', color: 'bg-stone-100 text-stone-600 border-stone-200' };
  };
  const currentBadge = getBadgeTier(wonSalesTotal);

  // --- Real-time Segment-Aware Catalog Retrieval ---
  const segmentCatalog = useMemo(() => {
    return getRawCatalogBySegment(activeSegment);
  }, [activeSegment]);

  // Reset category on segment change to avoid empty queries
  useEffect(() => {
    setActiveCatalogCategory('Todos');
  }, [activeSegment]);

  // --- Real-time Catalog Search Query Filter ---
  const filteredCatalogQuery = useMemo(() => {
    let results = segmentCatalog;
    const isSearching = catalogSearch.trim().length > 0;

    if (isSearching) {
      const globalResults = searchProducts(catalogSearch, activeSegment);
      if (activeCatalogCategory !== 'Todos') {
        const localResults = globalResults.filter(p => p.category === activeCatalogCategory);
        if (localResults.length > 0) {
          return localResults;
        }
        return globalResults;
      }
      return globalResults;
    } else {
      if (activeCatalogCategory !== 'Todos') {
        results = results.filter(p => p.category === activeCatalogCategory);
      }
      return results;
    }
  }, [catalogSearch, activeCatalogCategory, segmentCatalog, activeSegment]);

  const isFallbackSearch = useMemo(() => {
    if (!catalogSearch.trim() || activeCatalogCategory === 'Todos') return false;
    const globalResults = searchProducts(catalogSearch, activeSegment);
    if (globalResults.length === 0) return false;
    const localResults = globalResults.filter(p => p.category === activeCatalogCategory);
    return localResults.length === 0;
  }, [catalogSearch, activeCatalogCategory, activeSegment]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(segmentCatalog.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [segmentCatalog]);

  const handleAddCustomProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) {
      toast.error("Por favor, digite o nome do produto!");
      return;
    }
    const priceNum = parseFloat(customItemPrice) || 0;
    if (priceNum <= 0) {
      toast.error("O preço deve ser superior a zero!");
      return;
    }

    // Dynamic specification construction per catalog segment category
    let specStr = '';
    if (activeSegment === 'furniture') {
      const parts = [];
      if (customMaterial) parts.push(`Material: ${customMaterial}`);
      if (customVolume) parts.push(`Dimensões: ${customVolume}`);
      specStr = parts.join(' | ') || 'Design Sob Encomenda';
    } else if (activeSegment === 'clothing') {
      const parts = [];
      if (customSize) parts.push(`Tamanho: ${customSize}`);
      if (customColor) parts.push(`Cor: ${customColor}`);
      if (customMaterial) parts.push(`Tecido: ${customMaterial}`);
      specStr = parts.join(' | ') || 'Vestuário sob medida';
    } else if (activeSegment === 'shoes') {
      const parts = [];
      if (customSize) parts.push(`Numeração: ${customSize}`);
      if (customColor) parts.push(`Cor: ${customColor}`);
      if (customMaterial) parts.push(`Acabamento: ${customMaterial}`);
      specStr = parts.join(' | ') || 'Calçado sob medida';
    } else if (activeSegment === 'perfume') {
      const parts = [];
      if (customVolume) parts.push(`Volumetria: ${customVolume}`);
      if (customColor) parts.push(`Fragrância: ${customColor}`);
      if (customBrand) parts.push(`Marca: ${customBrand}`);
      specStr = parts.join(' | ') || 'Cosmético Perfumaria';
    }

    const customProd: Product = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: customItemCode.trim() || `PERS${Math.floor(1000 + Math.random() * 9000)}`,
      name: customItemName.trim(),
      nickname: customItemName.trim(),
      description: customItemDesc.trim() || `Item personalizado corporativo (${activeSegment === 'furniture' ? 'Móveis' : activeSegment === 'clothing' ? 'Roupas' : activeSegment === 'shoes' ? 'Calçados' : 'Perfumaria'})`,
      specifications: specStr,
      imageUrl: activeSegment === 'clothing'
        ? 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=120&q=80'
        : activeSegment === 'shoes'
        ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80'
        : activeSegment === 'perfume'
        ? 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&q=80'
        : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=80',
      category: customItemCategory.trim() || 'Customizado',
      price: priceNum
    };

    handleAddProductToCart(customProd);

    // Clean critical fields only
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemCode('');
    setCustomItemDesc('');
  };

  // --- Form & Cart Interactive Handlers ---
  const toggleProductSpecs = (productId: string) => {
    setExpandedProductSpecs(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    setClientPhone(val);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCurrencyInput(rawVal);
    setQuoteValueStr(formatted);

    const valueNum = parseCurrencyInput(formatted);
    setSelectedItems(prev => {
      if (prev.length === 1) {
        return prev.map(item => ({
          ...item,
          price: valueNum / item.quantity
        }));
      } else if (prev.length > 1) {
        // Intelligent multi-item price distribution:
        // Calculate sum of quantities and sum of current prices
        const currentSum = prev.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalQty = prev.reduce((acc, item) => acc + item.quantity, 0);

        if (currentSum > 0) {
          // Adjust existing prices proportionally based on their weight in the current layout
          let tempSum = 0;
          const ratio = valueNum / currentSum;
          return prev.map((item, idx) => {
            if (idx === prev.length - 1) {
              // Remaining cents adjustment on the last product to match total valueNum exactly
              const calculatedPrice = Math.max(0, Number(((valueNum - tempSum) / item.quantity).toFixed(2)));
              return { ...item, price: calculatedPrice };
            } else {
              const itemTotal = Number((item.price * item.quantity * ratio).toFixed(2));
              tempSum += itemTotal;
              return { ...item, price: Number((itemTotal / item.quantity).toFixed(2)) };
            }
          });
        } else if (totalQty > 0) {
          // Distribute the valueNum completely and equally among all items (and match exactly down to cents)
          let tempSum = 0;
          return prev.map((item, idx) => {
            if (idx === prev.length - 1) {
              const calculatedPrice = Math.max(0, Number(((valueNum - tempSum) / item.quantity).toFixed(2)));
              return { ...item, price: calculatedPrice };
            } else {
              const itemTotal = Number((valueNum * (item.quantity / totalQty)).toFixed(2));
              tempSum += itemTotal;
              return { ...item, price: Number((itemTotal / item.quantity).toFixed(2)) };
            }
          });
        }
      }
      return prev;
    });

    setCustomSimulatedAmount(valueNum.toString());
  };

  // Safe Add Product to Cart
  const handleAddProductToCart = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      let updated: QuoteItem[];
      
      if (existing) {
        updated = prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        toast.info(`Quantidade de "${product.nickname}" aumentada no carrinho!`);
      } else {
        const newItem: QuoteItem = {
          productId: product.id,
          code: product.code,
          name: product.name,
          nickname: product.nickname,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
          description: product.description
        };
        updated = [...prev, newItem];
        toast.success(`"${product.nickname}" adicionado ao carrinho!`);
      }

      // Auto calculate form totals to maintain backward support
      const newTotal = updated.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setQuoteValueStr(formatCurrency(newTotal).replace('R$', '').trim());
      
      // Auto fill interest summary
      const summary = updated.map(item => `${item.quantity}x ${item.nickname}`).join(' + ');
      setProductInterest(summary);

      // Also set calculator default simulation value
      setCustomSimulatedAmount(newTotal.toString());

      return updated;
    });
  };

  // Update specific cart item price interactively
  const handleUpdateCartItemPrice = (productId: string, newPrice: number) => {
    setSelectedItems(prev => {
      const updated = prev.map(item => 
        item.productId === productId 
          ? { ...item, price: newPrice }
          : item
      );

      // Recalculate full cart summary totals
      const newTotal = updated.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setQuoteValueStr(formatCurrency(newTotal).replace('R$', '').trim());
      
      const summary = updated.map(item => `${item.quantity}x ${item.nickname}`).join(' + ');
      setProductInterest(summary);
      setCustomSimulatedAmount(newTotal.toString());
      
      return updated;
    });
  };

  // Auto-Fill Form directly with single product details (Fallback support)
  const handleQuickAutofillProduct = (product: Product) => {
    setProductInterest(product.name);
    setQuoteValueStr(formatCurrency(product.price).replace('R$', '').trim());
    setCustomSimulatedAmount(product.price.toString());
    toast.success(`Formulário preenchido com "${product.nickname}"!`);
  };

  const handleIncreaseCartQty = (productId: string) => {
    setSelectedItems(prev => {
      const updated = prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      
      const newTotal = updated.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setQuoteValueStr(formatCurrency(newTotal).replace('R$', '').trim());
      setProductInterest(updated.map(item => `${item.quantity}x ${item.nickname}`).join(' + '));
      setCustomSimulatedAmount(newTotal.toString());
      return updated;
    });
  };

  const handleDecreaseCartQty = (productId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (!existing) return prev;

      let updated: QuoteItem[];
      if (existing.quantity <= 1) {
        updated = prev.filter(item => item.productId !== productId);
        toast.info('Item removido do carrinho');
      } else {
        updated = prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      const newTotal = updated.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setQuoteValueStr(updated.length > 0 ? formatCurrency(newTotal).replace('R$', '').trim() : '');
      setProductInterest(updated.map(item => `${item.quantity}x ${item.nickname}`).join(' + '));
      setCustomSimulatedAmount(updated.length > 0 ? newTotal.toString() : '');
      return updated;
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setSelectedItems(prev => {
      const updated = prev.filter(item => item.productId !== productId);
      toast.info('Item removido com sucesso!');
      
      const newTotal = updated.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setQuoteValueStr(updated.length > 0 ? formatCurrency(newTotal).replace('R$', '').trim() : '');
      setProductInterest(updated.map(item => `${item.quantity}x ${item.nickname}`).join(' + '));
      setCustomSimulatedAmount(updated.length > 0 ? newTotal.toString() : '');
      return updated;
    });
  };

  const clearCart = () => {
    setSelectedItems([]);
    setQuoteValueStr('');
    setProductInterest('');
    setCustomSimulatedAmount('');
    toast.info('Carrinho esvaziado');
  };

  // --- ARQUITETO CRITICAL GUARDRAILS AND SAVE ---
  const handleSaveQuote = async (e: React.FormEvent, sendToWhatsApp: boolean = false, generatePDF: boolean = false) => {
    e.preventDefault();
    
    // Safety check 1: Responsible branch validation
    if (!currentUser.branchId) {
      return toast.error('Operação negada: Seu cadastro de Vendedor não possui nenhuma Filial ativa atribuída.');
    }

    // Safety check 2: Text Inputs Sanitization
    const trimmedName = clientName.trim();
    if (!trimmedName) {
      return toast.error('Bloqueio de Segurança: O nome do cliente é obrigatório e não pode conter apenas espaços.');
    }

    // Safety check 3: Phone Length Check (block Brazilian incomplete entries)
    if (clientPhone.length < 10) {
      return toast.error('Bloqueio de Segurança: O número de WhatsApp precisa ter DDD + 8 ou 9 dígitos (mínimo 10 caracteres numéricos).');
    }

    // Safety check 4: Date sanity check (Cannot set follow-up in the past)
    if (!returnDate) {
      return toast.error('A data futura de retorno ou contato é obrigatória.');
    }
    
    const pickedDate = new Date(`${returnDate}T12:00:00Z`);
    const limitToday = new Date();
    limitToday.setHours(0,0,0,0);
    if (pickedDate.getTime() < limitToday.getTime()) {
      return toast.error('Bloqueio de Agenda: Não é permitido agendar uma data de retorno retroativa ao dia de hoje.');
    }

    // Safety check 5: Total Value Validation
    const valueNum = parseCurrencyInput(quoteValueStr);
    if (isNaN(valueNum) || valueNum <= 0) {
      return toast.error('Valor Financeiro Inválido: O total do orçamento precisa ser maior que zero.');
    }

    // Capture dynamic freight and assembly calculations
    const finalShippingFee = parseCurrencyInput(shippingFeeStr);
    const finalAssemblyFee = isAssemblyFree ? 0 : parseCurrencyInput(assemblyFeeStr);
    const grandTotal = valueNum + finalShippingFee + finalAssemblyFee;

    // Prepare items list safely
    const finalItems = selectedItems.length > 0 ? selectedItems : [{
      productId: 'custom-item',
      code: 'GEN-01',
      name: productInterest || 'Atendimento / Itens Gerais',
      nickname: 'Móveis Gerais',
      price: valueNum,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100&q=80',
      description: 'Mobiliário corporativo ou residencial personalizado de acordo com o plano de ambiente.'
    }];

    const ISOdate = pickedDate.toISOString();

    const newQuoteObj = {
      clientName: trimmedName,
      clientPhone,
      productInterest: productInterest || 'Itens diversos de mobiliário',
      value: grandTotal, // The overall grand total is stored as value of the quote
      category,
      customCategoryReason: category === 'other' ? customCategoryReason : undefined,
      returnDate: ISOdate,
      createdBy: currentUser.id,
      branchId: currentUser.branchId,
      items: finalItems,
      notes: observations.trim() || 'Nenhuma observação informada.',
      validityDays: validityDays,
      shippingFee: finalShippingFee,
      assemblyFee: finalAssemblyFee,
      isAssemblyFree: isAssemblyFree
    };

    // 1. Save locally
    addQuote(newQuoteObj);

    // Dynamic quote reference (needed to create PDF with proper generated dates and temporary object simulation)
    const quoteForDoc = {
      ...newQuoteObj,
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    let pfdSuccess = false;

    // 2. Generate PDF locally
    if (generatePDF) {
      const loadId = toast.loading('Processando layout profissional do PDF...');
      pfdSuccess = await generateProfessionalQuotePDF({
        quote: quoteForDoc as any,
        sellerName: currentUser.name,
        branchName: myBranch ? myBranch.name : 'RadarConquista',
        sellerPhone: currentUser.phone
      });
      toast.dismiss(loadId);
      if (pfdSuccess) {
        toast.success('Documento PDF gerado e baixado no dispositivo!');
      } else {
        toast.error('Erro na criação automática do PDF corporativo. Dados salvos.');
      }
    }

    // 3. WhatsApp dispatch
    if (sendToWhatsApp) {
      const todayStr = new Date().toLocaleDateString('pt-BR');
      let itemsLines = '';
      
      finalItems.forEach(item => {
        itemsLines += `• *${item.quantity}x ${item.nickname}* (Preço Un: ${formatCurrency(item.price)})\n`;
      });

      const messageContent = 
`🎯 *RADARCONQUISTA* 🎯
_Transformando atendimento em conquista de vendas._

Olá, *${trimmedName}*!
Espero que esteja excelente! Aqui estão as condições exclusivas do orçamento que preparamos para você na nossa unidade *${myBranch ? myBranch.name : 'RadarConquista'}*:

━━━━━━━━━━━━━━━━━━━━
📝 *DADOS DA PROPOSTA*
━━━━━━━━━━━━━━━━━━━━
Vendedor: ${currentUser.name}
Data: ${todayStr}
Validade: ${validityDays} dias

📦 *PRODUTOS SELECIONADOS:*
${itemsLines}
🛋️ *VALOR DOS MÓVEIS:* ${formatCurrency(valueNum)}
🚚 *TAXA DE ENTREGA (FRETE):* ${finalShippingFee > 0 ? formatCurrency(finalShippingFee) : 'GRÁTIS'}
🔧 *SERVIÇO DE MONTAGEM:* ${isAssemblyFree || finalAssemblyFee === 0 ? 'GRÁTIS' : formatCurrency(finalAssemblyFee)}
💰 *VALOR TOTAL GERAL:* ${formatCurrency(grandTotal)}

━━━━━━━━━━━━━━━━━━━━
📌 ${generatePDF ? '📄 _O PDF formal detalhado foi enviado para seu e-mail ou disponibilizado para download. Caso precise, posso reenviar!_' : ''}

Ficamos à inteira disposição para aprovar seu pedido hoje mesmo e liberar sua entrega rápida! Qual forma de pagamento fica melhor para você hoje?`;

      window.open(generateWhatsAppLink(clientPhone, messageContent), '_blank');
    }

    toast.success('Orçamento registrado com sucesso no painel RadarConquista!');

    // Reset workflow states safely
    setClientName('');
    setClientPhone('');
    setProductInterest('');
    setQuoteValueStr('');
    setReturnDate('');
    setCategory('researching');
    setCustomCategoryReason('');
    setSelectedItems([]);
    setObservations('');
    setValidityDays(5);
    setShippingFeeStr('0,00');
    setIsAssemblyFree(true);
    setAssemblyFeeStr('0,00');
    setActiveTab('home'); // Go to list/dashboard
  };

  // Trigger PDF for legacy/existing follow-up items
  const handleDownloadExistingPDF = async (quote: any) => {
    const loadId = toast.loading('Iniciando conversão para PDF...');
    const success = await generateProfessionalQuotePDF({
      quote: quote,
      sellerName: currentUser.name,
      branchName: myBranch ? myBranch.name : 'Atendimento RadarConquista',
      sellerPhone: currentUser.phone
    });
    toast.dismiss(loadId);
    if (success) {
      toast.success('PDF do orçamento gerado e enviado para download!');
    } else {
      toast.error('Falha ao processar arquivo PDF.');
    }
  };

  // --- SIMULATOR INSTALLMENT MATHS ---
  const currentSimulatedValue = useMemo(() => {
    if (customSimulatedAmount) {
      return parseFloat(customSimulatedAmount) || 0;
    }
    // Fallback to cart total
    return selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [customSimulatedAmount, selectedItems]);

  const simulatedInstallments = useMemo(() => {
    const value = currentSimulatedValue;
    if (value <= 0) return [];

    const list = [];
    if (interestType === 'no_interest') {
      // 1x up to maximum specified (e.g. 10x sem juros)
      const maxInstallments = Math.max(1, installmentsCount);
      for (let i = 1; i <= maxInstallments; i++) {
        list.push({
          number: i,
          installmentValue: value / i,
          totalValue: value,
          interestRate: 0,
          description: 'Sem Juros (Cartão)'
        });
      }
    } else {
      // Boleto / Financeira with Compound Interest Formula: M = P * (1 + i)^n
      const rate = monthlyInterestRate / 100;
      const maxInstallments = Math.max(1, installmentsCount);
      for (let n = 1; n <= maxInstallments; n++) {
        let installValue = 0;
        let totalVal = value;
        
        if (rate === 0) {
          installValue = value / n;
        } else {
          // Standard French amortisation schedule formula: PMT = PV * ( i * (1+i)^n ) / ( (1+i)^n - 1 )
          installValue = value * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
          totalVal = installValue * n;
        }

        list.push({
          number: n,
          installmentValue: installValue,
          totalValue: totalVal,
          interestRate: monthlyInterestRate,
          description: 'Carne / Boleto Bancário'
        });
      }
    }
    return list;
  }, [currentSimulatedValue, interestType, installmentsCount, monthlyInterestRate]);

  // Copy simulated text helper
  const handleCopySimulationToClipboard = () => {
    if (currentSimulatedValue <= 0) return toast.error('Nenhum valor simulado encontrado');
    
    let text = `🛋️ *SONO SHOW MÓVEIS* 🛋️\n_Simulação de Pagamento para seu ambiente_\n\n*Valor Total à Vista:* ${formatCurrency(currentSimulatedValue)}\n━━━━━━━━━━━━━━━━━━━━\n`;
    
    // Choose 3 convenient installment tiers (ex 1x, 3x, 5x, 10x)
    const tiers = [1, Math.min(3, simulatedInstallments.length), Math.min(6, simulatedInstallments.length), Math.min(10, simulatedInstallments.length)];
    const uniqueTiers = Array.from(new Set(tiers)).filter(t => t <= simulatedInstallments.length && t > 0);
    
    uniqueTiers.forEach(t => {
      const match = simulatedInstallments.find(i => i.number === t);
      if (match) {
        text += `👉 *${match.number}x de ${formatCurrency(match.installmentValue)}* (${match.description})\n`;
      }
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━\n_Valores sujeitos a alteração cadastral. Frete & Montagem inclusos!_`;
    
    navigator.clipboard.writeText(text);
    toast.success('Simulação de parcelamento copiada para a área de transferência!');
  };


  // ==========================================
  // VIEW RENDER 1: HOME PANEL (DASHBOARD & TARGETS)
  // ==========================================
  const renderSalespersonHome = () => {
    return (
      <div className="space-y-6">
        
        {/* NOVO: Painel de Lembretes VIP com Cards Modernos (Substituindo o alerta simples/vago) */}
        {quotesNeedingAttention.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-amber-500/5 border border-amber-900/10 space-y-4"
          >
            <div className="flex items-center gap-2 pb-1 border-b border-amber-900/10 justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <h3 className="text-xs font-black uppercase text-amber-950 tracking-wider font-sans select-none">
                  Lembrete Importante: Clientes Aguardando Retorno Hoje
                </h3>
              </div>
              <Badge className="bg-amber-100 text-amber-900 font-extrabold uppercase text-[8.5px] border-none py-0.5 px-2.5">
                {quotesNeedingAttention.length} pendentes
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {quotesNeedingAttention.map(quote => (
                <motion.div
                  key={quote.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="flex flex-col md:flex-row justify-between p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-stone-900 border border-amber-500/30 hover:border-amber-500/60 shadow-lg relative overflow-hidden group transition-all"
                >
                  {/* Glowing background ambience to match system standard + illustration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />

                  {/* Left Column: Stylized Flat Vector Illustration (Matches the user's uploaded banner concept) */}
                  <div className="flex md:flex-col gap-4 items-center md:items-start shrink-0 mb-4 md:mb-0 md:mr-4 select-none pb-3 md:pb-0 border-b border-white/5 md:border-b-0">
                    <div className="relative w-36 h-24 bg-slate-950/70 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
                      {/* Grid Lines Pattern for tech feel */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff07_1px,transparent_1px)] [background-size:10px_10px] opacity-70" />
                      
                      {/* Flat Wall Clock (From user image) */}
                      <div className="absolute top-2 left-3 w-7 h-7 rounded-full border border-amber-400/30 bg-indigo-950/65 flex items-center justify-center shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <div className="absolute top-1.5 right-[13px] w-0.5 h-2.5 bg-amber-400 origin-bottom transform rotate-[45deg]" />
                        <div className="absolute top-[13px] left-2 w-2 h-0.5 bg-amber-400 origin-right" />
                      </div>

                      {/* Stacked Furniture/Delivery Boxes (From user image) */}
                      <div className="absolute bottom-2 left-2 flex items-end gap-1.5 scale-90 origin-bottom-left">
                        {/* Box 1 */}
                        <div className="w-5 h-5 bg-emerald-600 rounded-md relative flex items-center justify-center shadow-md">
                          <div className="w-full h-1 bg-emerald-700 absolute top-1" />
                          <div className="w-1 h-2 bg-amber-900/40 rounded-xs" />
                        </div>
                        {/* Box 2 (Larger) */}
                        <div className="w-6 h-8 bg-amber-700 rounded-md relative flex items-center justify-center shadow-md border-t border-amber-500/40">
                          <div className="w-full h-1 bg-amber-800 absolute top-1.5" />
                          <div className="w-1 h-3.5 bg-stone-900/30 rounded-xs" />
                        </div>
                      </div>

                      {/* Person silhouettes/desk workspace (From user image) */}
                      <div className="absolute bottom-2 right-2 w-16 h-10 bg-indigo-900/30 rounded-lg border border-white/10 flex items-center justify-center">
                        {/* Minimalist Laptop screen */}
                        <div className="absolute bottom-1 w-11 h-1 bg-stone-300 rounded-full" />
                        <div className="absolute bottom-2 w-9 h-6 bg-slate-900 rounded border border-indigo-400/50 flex flex-col justify-between p-1 overflow-hidden">
                          <div className="w-full h-1 bg-amber-400/20 rounded-2xs flex justify-between px-0.5">
                            <div className="w-2 h-0.5 bg-amber-400 rounded-full" />
                            <div className="w-1 h-0.5 bg-indigo-400 rounded-full" />
                          </div>
                          <div className="w-full h-2.5 bg-emerald-500/10 rounded-2xs flex items-center justify-center">
                            <span className="text-[5px] font-sans text-emerald-400 font-extrabold leading-0">OK</span>
                          </div>
                        </div>
                      </div>

                      {/* User Working Silhouette Glow */}
                      <div className="absolute bottom-1 right-12 w-6 h-7 rounded-t-full bg-gradient-to-t from-[#5850ec] to-amber-500/50 opacity-90 shadow-md" />
                    </div>

                    <div className="hidden md:block">
                      <span className="block text-[8px] font-extrabold text-amber-500/70 font-mono tracking-widest">SISTEMA ATIVO</span>
                      <span className="block text-[10px] font-black text-white font-mono mt-0.5">
                        {formatLocalDate(quote.returnDate)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Information & Actions */}
                  <div className="flex-1 flex flex-col justify-between space-y-3.5 min-w-0">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                            📢 Retorno Pendente
                          </span>
                          <h4 className="text-md md:text-lg font-black text-white tracking-tight uppercase mt-2 font-sans truncate drop-shadow-sm select-all">
                            {quote.clientName}
                          </h4>
                        </div>
                        <div className="text-right md:hidden">
                          <span className="block text-[9px] font-black text-amber-400 font-mono">
                            {formatLocalDate(quote.returnDate)}
                          </span>
                        </div>
                      </div>

                      {/* Glassmorphism item selection container */}
                      <div className="p-3 bg-white/5 border border-white/10 hover:border-white/15 rounded-2xl space-y-2 select-text backdrop-blur-md transition-all">
                        <div className="flex items-center justify-between text-[9px] font-bold text-stone-300 uppercase tracking-widest pb-1 border-b border-white/5">
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-amber-400" />
                            <span>Interesse Principal</span>
                          </div>
                          <span className="text-amber-400 font-mono">ID: #{quote.id.substring(0, 6)}</span>
                        </div>
                        
                        <p className="text-sm font-black text-white uppercase truncate flex items-center gap-1.5 mt-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                          {quote.productInterest || 'Consulta Geral'}
                        </p>

                        {quote.notes && (
                          <p className="text-[10px] text-stone-300 italic opacity-95">
                            Obs: "{quote.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom value overview & CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2.5 border-t border-white/5">
                      <div className="w-full sm:w-auto text-left flex items-baseline gap-1 select-all">
                        <span className="text-[9px] font-bold text-stone-300 uppercase tracking-wider">Orcamento:</span>
                        <span className="text-base font-black text-white font-mono tracking-tight">
                          {formatCurrency(quote.value)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 select-none">
                        {/* WhatsApp CTA Action */}
                        <Button
                          size="sm"
                          onClick={() => {
                            const msg = `Olá *${quote.clientName}*! Tudo bem?\nAqui é o consultor *${currentUser.name}* da Sono Show Móveis.\n\nLembra do orçamento de *${quote.productInterest}* no valor de *${formatCurrency(quote.value)}* que organizamos para você? \nEstou passando para saber se podemos aprovar o seu pedido ou se ficou alguma dúvida sobre as opções de parcelamento! Como ficou para você?`;
                            window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
                          }}
                          className="flex-1 sm:flex-none h-9 text-[9px] font-black uppercase px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] hover:scale-102 hover:shadow-lg hover:shadow-[#25D366]/20 transition-all text-white border-none flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chamar WhatsApp
                        </Button>
                        
                        {/* View Client Details Action */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('followup')}
                          className="h-9 text-[9px] font-black uppercase px-3 rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                        >
                          Ver Ficha
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* METRICS OVERVIEW PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Won Sales Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-emerald-600/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-500/10">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  Vendas Convertidas (Este Mês)
                </span>
                <div className="pt-2">
                  <div className="text-2xl font-black text-emerald-600 tracking-tight font-sans">
                    {formatCurrency(wonSalesTotal)}
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold mt-1">
                    Baseado em {wonQuotes.length} propostas fechadas
                  </p>
                </div>
              </div>
              <MiniSparkline points={[5, 15, 20, 25, 42, 55, wonQuotes.length || 10]} color="#10b981" />
            </div>
          </div>

          {/* Pipeline Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-amber-700/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-700/10">
                    <Target className="w-4 h-4" />
                  </span>
                  Pipeline em Negociação
                </span>
                <div className="pt-2">
                  <div className="text-2xl font-black text-stone-900 tracking-tight font-mono">
                    {formatCurrency(pendingQuotes.reduce((a,q) => a + q.value, 0))}
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold mt-1">
                    Tratativas com {pendingQuotes.length} clientes quentes
                  </p>
                </div>
              </div>
              <MiniSparkline points={[10000, 42000, 31000, 58000, 72000, 64000, pendingQuotes.reduce((a,q) => a + q.value, 0) || 20000]} color="#b45309" />
            </div>
          </div>

          {/* Nível Badge Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-stone-250/50 bg-white p-5 shadow-[0_4px_25px_rgba(28,25,23,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.06)] hover:border-[#b45309]/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-[#b45309]/10">
                    <Award className="w-4 h-4" />
                  </span>
                  Classificação de Desempenho
                </span>
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3.5 py-1 rounded-xl text-xs font-black border uppercase shadow-2xs tracking-widest ${currentBadge.color}`}>
                      {currentBadge.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold mt-2">
                    Nível de vendas ativo na corporação
                  </p>
                </div>
              </div>
              <MiniSparkline points={[1, 1, 2, 2, 3, 4, 3]} color="#b45309" />
            </div>
          </div>
        </div>

        {/* MOTIVATIONAL SALES THERMOMETER */}
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-250/60 bg-gradient-to-r from-white via-white to-stone-105/20 p-6 md:p-8 shadow-[0_12px_40px_rgba(28,25,23,0.02)] group transition-all duration-300 hover:shadow-[0_16px_48px_rgba(28,25,23,0.04)]">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] -mr-6 -mt-6 select-none pointer-events-none">
            <TrendingUp className="w-48 h-48 text-[#b45309]" />
          </div>
          
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="flex items-center text-xs font-black text-[#b45309] uppercase tracking-widest gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-amber-600 animate-pulse" /> Termômetro de Produtividade G-Atende
                </span>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Sua pontuação de faturamento mensal para desbloqueio do comissionamento VIP Diamante.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold leading-none select-none">
                <div className="text-right">
                  <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-extrabold">Meta Comercial</span>
                  <span className="text-stone-900 font-extrabold text-[13px]">{formatCurrency(salesGoal)}</span>
                </div>
                <div className="h-8 w-[1px] bg-stone-200"></div>
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-extrabold">Progresso Realizado</span>
                  <span className="text-[#b45309] font-black text-[13px]">{goalPercentage}% Concluído</span>
                </div>
              </div>
            </div>

            {/* Premium thermometer gradient progress bar */}
            <div className="relative">
              <div className="w-full h-4.5 bg-stone-100 rounded-full overflow-hidden border border-stone-250/50 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${goalPercentage}%` }} 
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 relative overflow-hidden"
                >
                  {/* Subtle animated light highlight sheen inside progress */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-4 text-[9px] font-black text-stone-400 uppercase tracking-widest pt-1.5 select-none text-center">
              <div className="transition-colors hover:text-stone-700">Iniciante<br/><span className="font-mono text-[8px] text-stone-400 pt-0.5 block">R$ 0</span></div>
              <div className="transition-colors hover:text-amber-800">Prata<br/><span className="font-mono text-[8px] text-stone-400 pt-0.5 block">R$ 10k</span></div>
              <div className="transition-colors hover:text-amber-700">Ouro<br/><span className="font-mono text-[8px] text-stone-400 pt-0.5 block">R$ 20k</span></div>
              <div className="transition-colors hover:text-amber-900">Diamante<br/><span className="font-mono text-[8px] text-stone-400 pt-0.5 block">R$ 35k</span></div>
            </div>
          </div>
        </div>

        {/* HOME FAST ATENDE TRADING ACTION CARD */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* List of outstanding actions */}
          <Card className="glass-card border-none h-fit">
            <CardHeader className="pb-4 border-b border-stone-100">
              <CardTitle className="text-sm font-black uppercase text-stone-900 tracking-wider">
                Próximos Retornos Agendados
              </CardTitle>
              <CardDescription className="text-xs text-stone-400 font-semibold">
                Sua lista de acompanhamento para fechar vendas hoje.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-stone-100">
              {pendingQuotes.slice(0, 4).map(quote => (
                <div key={quote.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-stone-950 truncate uppercase">{quote.clientName}</h5>
                    <p className="text-[10px] text-stone-400 font-medium truncate">{quote.productInterest}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                      {formatLocalDate(quote.returnDate)}
                    </span>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveTab('followup')}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-all hover:scale-105 bg-transparent border-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingQuotes.length === 0 && (
                <div className="py-12 text-center text-stone-400 font-medium text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                  Nenhum cliente em aberto pendente no pipeline de vendas!
                </div>
              )}
            </CardContent>
            {pendingQuotes.length > 0 && (
              <CardFooter className="pt-2 border-t border-stone-100 flex justify-center">
                <Button 
                  variant="link"
                  onClick={() => setActiveTab('followup')}
                  className="text-xs font-black text-amber-800 hover:text-amber-900 flex items-center gap-1.5 uppercase tracking-wider p-0 h-auto border-none underline-none hover:no-underline"
                >
                  Ver Todos os Orçamentos <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Quick instructions and advice banner */}
          <Card className="glass-card border-none bg-gradient-to-br from-amber-600/5 to-amber-700/[0.01]">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase text-stone-900 tracking-wider">
                💡 Dicas RadarConquista Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-stone-600 leading-relaxed font-semibold">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-600/10 text-amber-700 shrink-0 font-bold">1</div>
                <p><strong>Insista nos retornos:</strong> 72% das vendas de sofás e colchões são decididas na conversa de retorno (concorrência ou validação técnica).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-600/10 text-amber-700 shrink-0 font-bold">2</div>
                <p><strong>Aproveite o simulador financeiro:</strong> Sempre apresente as parcelas corrigidas no boleto ou carnê usando taxas menores. O cliente prefere pequenas parcelas mensais.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-600/10 text-amber-700 shrink-0 font-bold">3</div>
                <p><strong>Gere o PDF oficial:</strong> O cliente RadarConquista sente muito mais segurança ao comprar vendo uma proposta formal assinada em PDF.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setActiveTab('new_quote')}
                className="w-full h-11 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <PlusCircle className="w-4 h-4" /> Novo Atendimento
              </Button>
            </CardFooter>
          </Card>

        </div>

      </div>
    );
  };


  // ==========================================
  // VIEW RENDER 2: BRAND CATALOGUE & CART BUILDER
  // ==========================================
  const renderSalespersonNewQuote = () => {
    if (isQuoteInitializing) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Cart & Customer fields (Cols 7) */}
          <div className="xl:col-span-7 space-y-6 animate-pulse">
            <Card className="glass-card border-none overflow-hidden pb-4 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-stone-250 shrink-0" />
                  <div className="h-6 w-56 bg-stone-250 rounded-lg" />
                </div>
                <div className="h-3.5 w-4/5 bg-stone-150 rounded-md mt-3" />
              </CardHeader>

              <div className="space-y-6 p-5">
                {/* Client Cadastro Widget Skeleton */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/50 space-y-4">
                  <div className="h-4 w-36 bg-stone-250/80 rounded-md" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3.5 w-24 bg-stone-250/50 rounded-md ml-1" />
                      <div className="h-11 w-full bg-white border border-stone-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3.5 w-32 bg-stone-250/50 rounded-md ml-1" />
                      <div className="h-11 w-full bg-white border border-stone-200 rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Cart block skeleton */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-44 bg-stone-250/80 rounded-md" />
                  </div>
                  <div className="border border-dashed border-stone-200 rounded-xl p-8 text-center space-y-3 bg-white">
                    <div className="w-8 h-8 rounded-full bg-stone-100 mx-auto animate-pulse" />
                    <div className="h-4 w-32 bg-stone-150 rounded-md mx-auto" />
                    <div className="h-3 w-52 bg-stone-100 rounded-md mx-auto" />
                  </div>
                </div>

                {/* Date / Validity dropdowns skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-3.5 w-28 bg-stone-250/50 rounded-md ml-1" />
                    <div className="h-11 w-full bg-white border border-stone-200 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-24 bg-stone-250/50 rounded-md ml-1" />
                    <div className="h-11 w-full bg-white border border-stone-200 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-32 bg-stone-250/50 rounded-md ml-1" />
                    <div className="h-11 w-full bg-white border border-stone-200 rounded-xl" />
                  </div>
                </div>

                {/* Notes skeleton */}
                <div className="space-y-2">
                  <div className="h-3.5 w-36 bg-stone-250/50 rounded-md ml-1" />
                  <div className="h-16 w-full bg-stone-50 border border-stone-200 rounded-xl" />
                </div>
              </div>

              {/* Card Footer Skeletons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-stone-100 bg-stone-50">
                <div className="h-12 w-full sm:w-44 bg-stone-200 rounded-xl" />
                <div className="h-12 w-full sm:w-48 bg-stone-300 rounded-xl" />
              </div>
            </Card>
          </div>

          {/* Right Side: Interactive Search Catalog (Cols 5) */}
          <div className="xl:col-span-5 space-y-6 animate-pulse">
            <Card className="glass-card border-none overflow-hidden bg-white pb-3 shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4.5 h-4.5 bg-stone-250 rounded-md" />
                    <div className="h-5 w-36 bg-stone-250 rounded-lg" />
                  </div>
                  <div className="h-5 w-20 bg-stone-150 rounded-md" />
                </div>
                <div className="h-3.5 w-5/6 bg-stone-150 rounded-md mt-3" />
              </CardHeader>
              
              <div className="p-4 space-y-4">
                {/* Search bar skeleton */}
                <div className="h-11 w-full bg-stone-100 rounded-xl" />

                {/* Categories Scroll Pills Skeleton */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-stone-50 rounded-xl border border-stone-200/50">
                  <div className="h-7 w-12 bg-stone-250/60 rounded-lg" />
                  <div className="h-7 w-20 bg-stone-250/40 rounded-lg" />
                  <div className="h-7 w-16 bg-stone-250/40 rounded-lg" />
                  <div className="h-7 w-24 bg-stone-250/40 rounded-lg" />
                </div>

                {/* Products List Skeleton */}
                <div className="space-y-3.5 pt-1">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex gap-3 p-3.5 rounded-xl border border-stone-200 bg-white">
                      <div className="w-16 h-16 rounded-xl bg-stone-250 shrink-0" />
                      <div className="flex-1 space-y-2 mt-0.5">
                        <div className="h-4.5 w-4/5 bg-stone-250 rounded-md" />
                        <div className="h-3.5 w-2/5 bg-stone-150 rounded-md" />
                        <div className="h-3 w-1/2 bg-stone-150 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Cart & Customer fields (Cols 7) */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="glass-card border-none overflow-hidden pb-4 bg-white">
            <CardHeader className="border-b border-stone-100 pb-5">
              <CardTitle className="flex items-center text-lg font-black text-stone-900 uppercase italic tracking-tight">
                <ShoppingBag className="w-5 h-5 mr-2.5 text-amber-700" /> Novo Orçamento Comercial
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 font-semibold leading-relaxed">
                Preencha os dados do cliente e preencha o carrinho com os produtos que ele escolheu no showroom.
              </CardDescription>
            </CardHeader>

            <form onSubmit={e => handleSaveQuote(e, false, true)}>
              <CardContent className="space-y-6 pt-5">
                
                {/* Client detail widget */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/50 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">🧑‍💼 Cadastro Rápido de Cliente</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Nome Completo</Label>
                      <Input className="bg-white h-11 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300 focus:border-amber-700/50 focus:ring-0" placeholder="Ex: Maria Alice de Souza" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">WhatsApp de Contato</Label>
                      <Input className="bg-white h-11 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300 focus:border-amber-700/50 focus:ring-0" placeholder="DDD + Número" value={formatPhone(clientPhone)} onChange={handlePhoneChange} required />
                    </div>
                  </div>
                </div>

                {/* Simulated Shopping Cart with selections */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> Carrinho do Atendimento ({selectedItems.length})
                    </span>
                    {selectedItems.length > 0 && (
                      <Button type="button" variant="ghost" onClick={clearCart} className="text-[9px] font-bold text-rose-600 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-1 bg-transparent p-0 border-none h-auto">
                        <Trash2 className="w-3 h-3" /> Esvaziar
                      </Button>
                    )}
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className="border border-dashed border-stone-200 rounded-xl p-6 text-center text-stone-400 space-y-2 bg-white">
                      <ShoppingBag className="w-8 h-8 mx-auto opacity-30 text-amber-700" />
                      <p className="text-xs font-bold uppercase tracking-wider">Carrinho Vazio</p>
                      <p className="text-[10px] opacity-80 leading-relaxed max-w-sm mx-auto">Use o catálogo ao lado para buscar os móveis que o cliente gostou e clique em "Adicionar" para calcular o valor automático!</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {selectedItems.map((item) => (
                        <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-700/20 gap-3 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img src={item.imageUrl} alt={item.nickname} className="w-10 h-10 rounded-lg object-cover bg-stone-50 shrink-0" referrerPolicy="no-referrer" />
                            <div className="truncate min-w-0">
                              <h5 className="text-xs font-bold text-stone-900 truncate uppercase">{item.nickname}</h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-stone-400 font-mono">CÓD: {item.code}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            {/* Qty edit Controls */}
                            <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-1 border border-stone-200">
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => handleDecreaseCartQty(item.productId)}
                                className="w-5 h-5 rounded-md bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all border border-stone-200 shadow-xs active:scale-95 p-0"
                              >
                                <Minus className="w-2.5" />
                              </Button>
                              <span className="text-xs font-extrabold px-1 text-stone-800">{item.quantity}</span>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => handleIncreaseCartQty(item.productId)}
                                className="w-5 h-5 rounded-md bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all border border-stone-200 shadow-xs active:scale-95 p-0"
                              >
                                <Plus className="w-2.5" />
                              </Button>
                            </div>

                            <div className="flex flex-col items-end min-w-[90px]">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black text-amber-850 shrink-0 select-none">R$</span>
                                <CartItemPriceInput item={item} onUpdatePrice={handleUpdateCartItemPrice} />
                              </div>
                              {item.quantity > 1 && (
                                <span className="text-[8px] text-stone-400 font-bold mt-0.5 whitespace-nowrap">
                                  Total: {formatCurrency(item.price * item.quantity)}
                                </span>
                              )}
                            </div>
                            
                            <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveCartItem(item.productId)} className="text-stone-400 hover:text-rose-600 p-1 transition-all bg-transparent border-none w-auto h-auto">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products detail summary outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Resumo do Mobiliário de Interesse</Label>
                    <Input className="bg-stone-50 h-11 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300" placeholder="Ex: Sofá Retrátil, Conjunto de Jantar" value={productInterest} onChange={e => setProductInterest(e.target.value)} required />
                    <span className="text-[8px] text-stone-400 block font-medium">* Preenche sozinho quando adiciona itens do carrinho ou edite.</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Valor Total dos Móveis (R$)</Label>
                    <Input className="h-11 rounded-xl border-stone-200 text-lg font-black text-amber-700 focus:border-amber-700 bg-white" placeholder="0,00" value={quoteValueStr} onChange={handleValueChange} required />
                    <span className="text-[8px] text-stone-400 block font-medium">* Valor base dos móveis sem frete ou montagem.</span>
                  </div>
                </div>

                {/* NOVO: Organização Exclusiva de Frete e Montagem profissional */}
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-900/10 space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200/60">
                    <Truck className="w-5 h-5 text-amber-800" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-950">Serviços de Entrega e Montagem</h4>
                      <p className="text-[10px] text-stone-500 font-semibold">Defina de forma organizada se haverá taxas extras ou se a montagem/frete será cortesia.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Linha de Frete */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">🚚 Taxa de Entrega (Frete)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShippingFeeStr('0,00')}
                          className={`h-10 rounded-xl text-xs font-extrabold transition-all border ${
                            parseCurrencyInput(shippingFeeStr) === 0
                              ? 'bg-amber-950 text-white border-amber-950 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          Entrega Grátis
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (parseCurrencyInput(shippingFeeStr) === 0) {
                              setShippingFeeStr('50,00');
                            }
                          }}
                          className={`h-10 rounded-xl text-xs font-extrabold transition-all border ${
                            parseCurrencyInput(shippingFeeStr) > 0
                              ? 'bg-amber-950 text-white border-amber-950 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          Valor Manual
                        </button>
                      </div>

                      {parseCurrencyInput(shippingFeeStr) > 0 && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 pt-1">
                          <Label className="text-[9px] font-bold uppercase text-stone-500">Valor do Frete Cobrado (R$)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400">R$</span>
                            <Input
                              className="h-10 pl-9 rounded-xl border-stone-200 text-xs font-bold text-stone-950 bg-white"
                              value={shippingFeeStr}
                              onChange={(e) => setShippingFeeStr(formatCurrencyInput(e.target.value))}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Linha de Montagem */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">🔧 Serviço de Montagem</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAssemblyFree(true);
                            setAssemblyFeeStr('0,00');
                          }}
                          className={`h-10 rounded-xl text-xs font-extrabold transition-all border ${
                            isAssemblyFree
                              ? 'bg-amber-950 text-white border-amber-950 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          Montagem Grátis
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAssemblyFree(false);
                            if (parseCurrencyInput(assemblyFeeStr) === 0) {
                              setAssemblyFeeStr('75,00');
                            }
                          }}
                          className={`h-10 rounded-xl text-xs font-extrabold transition-all border ${
                            !isAssemblyFree
                              ? 'bg-amber-950 text-white border-amber-950 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          Cobrar Montagem
                        </button>
                      </div>

                      {!isAssemblyFree && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 pt-1">
                          <Label className="text-[9px] font-bold uppercase text-stone-500">Valor da Montagem Cobrada (R$)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400">R$</span>
                            <Input
                              className="h-10 pl-9 rounded-xl border-stone-200 text-xs font-bold text-stone-950 bg-white"
                              value={assemblyFeeStr}
                              onChange={(e) => setAssemblyFeeStr(formatCurrencyInput(e.target.value))}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Resumo Consolidado do Fechamento */}
                  <div className="mt-4 p-4 rounded-xl bg-stone-950 text-stone-100 space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 block">Detalhamento da Proposta e Valores</span>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400 font-medium font-sans">🛋️ Total dos Móveis:</span>
                      <span className="font-extrabold text-white">
                        {formatCurrency(parseCurrencyInput(quoteValueStr))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400 font-medium font-sans">🚚 Taxa de Entrega (Frete):</span>
                      <span className={`font-black ${parseCurrencyInput(shippingFeeStr) === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {parseCurrencyInput(shippingFeeStr) === 0 ? 'CORTESIA / GRÁTIS' : formatCurrency(parseCurrencyInput(shippingFeeStr))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400 font-medium font-sans">🔧 Serviço de Montagem:</span>
                      <span className={`font-black ${isAssemblyFree || parseCurrencyInput(assemblyFeeStr) === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {isAssemblyFree || parseCurrencyInput(assemblyFeeStr) === 0 ? 'CORTESIA / GRÁTIS' : formatCurrency(parseCurrencyInput(assemblyFeeStr))}
                      </span>
                    </div>

                    <div className="h-px bg-stone-800 my-1" />

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-amber-500 uppercase tracking-wider">💰 VALOR TOTAL GERAL DA PROPOSTA:</span>
                      <span className="text-lg font-black text-white tracking-tight">
                        {formatCurrency(
                          parseCurrencyInput(quoteValueStr) +
                          parseCurrencyInput(shippingFeeStr) +
                          (isAssemblyFree ? 0 : parseCurrencyInput(assemblyFeeStr))
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CRM Metadata diagnostic checks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Prazo Validade Proposta</Label>
                    <select
                      value={validityDays.toString()}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="2">2 Dias (Curto)</option>
                      <option value="5">5 Dias (Padrão)</option>
                      <option value="10">10 Dias (Especial)</option>
                      <option value="15">15 Dias (Máximo)</option>
                    </select>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 mt-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 text-[9px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Válida até: <strong className="font-extrabold">{targetValidityDate}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Previsão Retorno Contato</Label>
                    <Input className="h-11 rounded-xl border-stone-200 text-xs font-bold text-stone-850 bg-white" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                    <span className="text-[8px] text-stone-400 block font-medium">* Dia de entrar em contato pós-showroom.</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Diagnóstico do Atendimento</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as QuoteCategory)}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="researching">Só Pesquisando Preço</option>
                      <option value="card_turning">Aguardando Virada de Cartão</option>
                      <option value="price_high">Achou o Valor Alto</option>
                      <option value="needs_spouse">Pendente Validação Cônjuge</option>
                      <option value="other">Outros Motivos Especial</option>
                    </select>
                  </div>
                </div>

                {category === 'other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                    <Label className="text-[10.5px] font-bold text-amber-700 ml-1">Descrição do Motivo Comercial</Label>
                    <Input 
                      className="h-11 rounded-xl border-amber-600/30 text-xs font-bold placeholder:text-stone-300 text-stone-900 bg-white" 
                      placeholder="Qual a barreira de venda ou urgência especial?" 
                      value={customCategoryReason} 
                      onChange={e => setCustomCategoryReason(e.target.value)} 
                      required 
                    />
                  </motion.div>
                )}

                {/* Manual written reviews printed to PDF */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1 font-sans">Observações Comentadas (Inclusas no Orçamento & PDF)</Label>
                  <textarea 
                    className="w-full bg-stone-50 rounded-xl border border-stone-200 p-3 text-xs placeholder:text-stone-300 text-stone-800 min-h-[70px] max-h-[140px] focus:outline-none focus:border-amber-700/50"
                    placeholder="Ex: Condição de desconto válida para aprovação em 24h. Negociado frete grátis com a supervisão geral."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </div>

              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-stone-100 bg-stone-50">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto h-12 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider px-6 transition-all shadow-xs"
                >
                  📁 Gravar & Gerar PDF
                </Button>
                
                <Button 
                  type="button" 
                  onClick={(e) => handleSaveQuote(e, true, true)}
                  className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 shrink-0 text-white border-transparent"
                >
                  <Send className="w-4 h-4" /> Enviar PDF + WhatsApp
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Side: Interactive Search Catalog (Cols 5) */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="glass-card border-none overflow-hidden bg-white pb-3 shadow-xs">
            <CardHeader className="border-b border-stone-100 pb-5">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-sm font-black text-stone-900 uppercase tracking-widest">
                  <BookOpen className="w-4.5 h-4.5 mr-2 text-amber-700" /> Catálogo RadarConquista
                </CardTitle>
                <Badge className="bg-amber-75/15 text-amber-800 border-none rounded-md px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider select-none">
                  INTEGRADO
                </Badge>
              </div>
              <CardDescription className="text-xs text-stone-500 font-semibold leading-relaxed">
                Busca rápida de eletros e estofados para preenchimento.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {/* MÓDULO 2 - Local vs Online Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/50 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearchMode('local');
                    setCatalogSearch('');
                  }}
                  className={`py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all ${
                    catalogSearchMode === 'local'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-850 hover:bg-white/40'
                  }`}
                >
                  📁 Catálogo Local
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearchMode('online');
                    setCatalogSearch('');
                  }}
                  className={`py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 ${
                    catalogSearchMode === 'online'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-850 hover:bg-white/40'
                  }`}
                >
                  <Search className="w-3 h-3 text-amber-500" /> Busca Comercial Radar
                </button>
              </div>

              {/* SEGMENT SELECTOR TABS & DYNAMIC SCHEMA INTEGRATION */}
              <div className="space-y-1.5 border-b border-stone-100 pb-3 mt-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-0.5">Selecione o Segmento da Loja:</p>
                <div className="grid grid-cols-4 gap-1.5 select-none">
                  {[
                    { id: 'furniture', label: 'Móveis', icon: '🛋️' },
                    { id: 'clothing', label: 'Roupas', icon: '👕' },
                    { id: 'shoes', label: 'Calçados', icon: '👟' },
                    { id: 'perfume', label: 'Perfumes', icon: '🧴' }
                  ].map((seg) => (
                    <button
                      type="button"
                      key={seg.id}
                      onClick={() => setActiveSegment(seg.id as any)}
                      className={`py-1.5 text-[9.5px] font-black uppercase rounded-xl transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeSegment === seg.id
                          ? 'bg-amber-50 border-amber-700 text-amber-900 ring-1 ring-amber-700'
                          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-base leading-none">{seg.icon}</span>
                      <span className="text-[9px]">{seg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Site Selector / Editor Target */}
              {catalogSearchMode === 'online' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2.5 pb-2.5 border-b border-stone-100"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="sm:w-5/12">
                      <select
                        value={['www.sonoshowmoveis.com.br', 'catalogo.sonoshowmoveis.com.br'].includes(onlineCatalogUrl) ? onlineCatalogUrl : 'custom'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setOnlineCatalogUrl('exemplo-loja.com.br');
                          } else {
                            setOnlineCatalogUrl(val);
                          }
                          setOnlineProducts([]);
                        }}
                        className="w-full h-10 text-xs font-bold border border-stone-200 rounded-xl bg-white px-3.5 outline-none focus:border-amber-700/50 cursor-pointer appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '14px'
                        }}
                      >
                        <option value="www.sonoshowmoveis.com.br">🇧🇷 Loja Oficial Sono Show</option>
                        <option value="catalogo.sonoshowmoveis.com.br">🌍 Catálogo Sono Show Antigo</option>
                        <option value="custom">🌐 Outro e-Commerce...</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Insira o link ou domínio do site"
                        value={onlineCatalogUrl}
                        onChange={(e) => {
                          setOnlineCatalogUrl(e.target.value);
                          setOnlineProducts([]);
                        }}
                        className="h-10 text-xs font-bold border-stone-200 rounded-xl bg-white pr-4"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Filter search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <Input 
                    placeholder={
                      catalogSearchMode === 'local' 
                        ? "Buscar sofá, rack, código do produto (ex: CAM008)..." 
                        : "Digite Nome ou CÓDIGO do Produto no site..."
                    }
                    className="bg-white h-11 pl-10 pr-10 rounded-xl border-stone-200 text-xs font-bold text-stone-900 placeholder:text-stone-300 shadow-sm focus:ring-1 focus:ring-amber-500/20 w-full"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (catalogSearchMode === 'online' && catalogSearch.trim()) {
                          setIsOnlineCatalogSearching(true);
                          setOnlineError('');
                          try {
                            const data = await fetchCatalogWithRunFallback(onlineCatalogUrl, catalogSearch);
                            if (data.success && Array.isArray(data.products)) {
                              setOnlineProducts(data.products);
                            } else {
                              setOnlineError(data.error || 'Nenhum item detectado nesta URL.');
                            }
                          } catch (err) {
                            setOnlineError('Incapaz de conectar com o serviço de Catálogo Radar.');
                          } finally {
                            setIsOnlineCatalogSearching(false);
                          }
                        }
                      }
                    }}
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSearch('');
                        setOnlineProducts([]);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {catalogSearchMode === 'online' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!catalogSearch.trim()) return;
                      setIsOnlineCatalogSearching(true);
                      setOnlineError('');
                      try {
                        const data = await fetchCatalogWithRunFallback(onlineCatalogUrl, catalogSearch);
                        if (data.success && Array.isArray(data.products)) {
                          setOnlineProducts(data.products);
                        } else {
                          setOnlineError(data.error || 'Nenhum item detectado nesta URL.');
                        }
                      } catch (err) {
                        setOnlineError('Incapaz de conectar com o serviço de Catálogo Radar.');
                      } finally {
                        setIsOnlineCatalogSearching(false);
                      }
                    }}
                    disabled={isOnlineCatalogSearching}
                    className="bg-amber-700 hover:bg-amber-800 disabled:opacity-55 text-white rounded-xl px-4 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 h-11"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                )}
              </div>

              {/* COLLAPSIBLE CUSTOM ITEM FORM */}
              <div className="bg-stone-50/50 rounded-2xl border border-stone-200/65 overflow-hidden transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors border-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">➕</span>
                    <span>Inserir item de venda personalizado ({activeSegment === 'furniture' ? 'Móveis' : activeSegment === 'clothing' ? 'Roupas' : activeSegment === 'shoes' ? 'Calçados' : 'Perfumes'})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCustomFormOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCustomFormOpen && (
                  <form onSubmit={handleAddCustomProduct} className="p-4 pt-1 border-t border-stone-200/60 space-y-3.5 font-sans">
                    <p className="text-[10px] text-stone-400 font-medium leading-normal italic">
                      Cadastre um item avulso que não esteja listado no catálogo geral. Os campos abaixo se adaptam automaticamente ao segmento selecionado.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Nome do Item *</Label>
                        <Input
                          placeholder="Ex: Sofá Chesterfield 3L"
                          value={customItemName}
                          onChange={e => setCustomItemName(e.target.value)}
                          className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Preço Unitário (R$) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 1450.00"
                          value={customItemPrice}
                          onChange={e => setCustomItemPrice(e.target.value)}
                          className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Código / Ref (Opcional)</Label>
                        <Input
                          placeholder="Ex: CHEST03"
                          value={customItemCode}
                          onChange={e => setCustomItemCode(e.target.value)}
                          className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Categoria / Linha</Label>
                        <Input
                          placeholder={activeSegment === 'furniture' ? 'Ex: Sofás' : activeSegment === 'clothing' ? 'Ex: Casacos' : activeSegment === 'shoes' ? 'Ex: Social' : 'Ex: Colônias'}
                          value={customItemCategory}
                          onChange={e => setCustomItemCategory(e.target.value)}
                          className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC SEGMENT SPECIFIC FIELD FIELDS */}
                    <div className="p-3 bg-white rounded-xl border border-stone-150 space-y-2.5">
                      <p className="text-[9px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1 leading-none border-b border-stone-100 pb-2">
                        <span>⚙️</span> Ficha Técnica do Segmento: {activeSegment === 'furniture' ? 'Móveis' : activeSegment === 'clothing' ? 'Vestuário' : activeSegment === 'shoes' ? 'Calçados' : 'Perfumaria'}
                      </p>

                      {/* FURNITURE SPECIFIC FORM */}
                      {activeSegment === 'furniture' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Material de Estrutura</Label>
                            <Input
                              placeholder="Ex: 100% MDF Premium"
                              value={customMaterial}
                              onChange={e => setCustomMaterial(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Dimensões / Tamanho</Label>
                            <Input
                              placeholder="Ex: 2.30m x 1.05m"
                              value={customVolume}
                              onChange={e => setCustomVolume(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      {/* CLOTHING SPECIFIC FORM */}
                      {activeSegment === 'clothing' && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Tamanho</Label>
                            <select
                              value={customSize}
                              onChange={e => setCustomSize(e.target.value)}
                              className="w-full h-9 text-xs font-bold border border-stone-200 rounded-lg bg-white px-2.5"
                            >
                              {['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Cor / Estampa</Label>
                            <Input
                              placeholder="Ex: Azul Escuro"
                              value={customColor}
                              onChange={e => setCustomColor(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Tecido / Fios</Label>
                            <Input
                              placeholder="Ex: 100% Algodão"
                              value={customMaterial}
                              onChange={e => setCustomMaterial(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      {/* SHOES SPECIFIC FORM */}
                      {activeSegment === 'shoes' && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Numeração</Label>
                            <select
                              value={customSize}
                              onChange={e => setCustomSize(e.target.value)}
                              className="w-full h-9 text-xs font-bold border border-stone-200 rounded-lg bg-white px-2"
                            >
                              {['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Acabamento</Label>
                            <Input
                              placeholder="Ex: Café Sfumato"
                              value={customColor}
                              onChange={e => setCustomColor(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Material de Sola</Label>
                            <Input
                              placeholder="Ex: Couro Legítimo"
                              value={customMaterial}
                              onChange={e => setCustomMaterial(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      {/* PERFUME SPECIFIC FORM */}
                      {activeSegment === 'perfume' && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Volumetria</Label>
                            <select
                              value={customVolume}
                              onChange={e => setCustomVolume(e.target.value)}
                              className="w-full h-9 text-xs font-bold border border-stone-200 rounded-lg bg-white px-2"
                            >
                              {['50ml', '75ml', '90ml', '100ml', '150ml', '200ml', '400g'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Fragrância / Família</Label>
                            <Input
                              placeholder="Ex: Amadeirado Intenso"
                              value={customColor}
                              onChange={e => setCustomColor(e.target.value)}
                              className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Marca / Fabricante</Label>
                            <select
                              value={customBrand}
                              onChange={e => setCustomBrand(e.target.value)}
                              className="w-full h-9 text-xs font-bold border border-stone-200 rounded-lg bg-white px-1.5"
                            >
                              {['O Boticário', 'Eudora', 'Natura', 'Cacau Show', 'Exótica Imp.', 'Outros'].map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[9.5px] font-bold text-stone-500 uppercase ml-0.5">Comentários Complementares (No pdf)</Label>
                      <Input
                        placeholder="Ex: Acompanha embalagem decorada para presente."
                        value={customItemDesc}
                        onChange={e => setCustomItemDesc(e.target.value)}
                        className="h-9 text-xs font-bold bg-white border-stone-200 rounded-lg"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 bg-stone-900 border-none hover:bg-amber-700 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      🛒 Adicionar Item Customizado ao Carrinho
                    </Button>
                  </form>
                )}
              </div>

              {/* Real-time search status & matches indicators */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                  {catalogSearchMode === 'local' ? (
                    <>
                      <span>Móveis Disponíveis ({filteredCatalogQuery.length})</span>
                      {catalogSearch.trim() && (
                        <span className="text-amber-700 font-extrabold normal-case bg-amber-50 px-2 py-0.5 rounded-md">
                          Filtrando catálogo...
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>Produtos Detectados ({mappedOnlineProducts.length})</span>
                      {isOnlineCatalogSearching ? (
                        <span className="text-amber-800 font-semibold flex items-center gap-1 normal-case bg-amber-55/15 px-2 py-0.5 rounded-md">
                          <span className="w-2 h-2 rounded-full border-2 border-amber-700 border-t-transparent animate-spin"></span>
                          Detectando plataforma & buscando...
                        </span>
                      ) : catalogSearch.trim() && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md normal-case">
                          Conectado com o site oficial
                        </span>
                      )}
                    </>
                  )}
                </div>

                {catalogSearchMode === 'local' && isFallbackSearch && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[9px] font-black uppercase tracking-wider py-2 px-3 rounded-xl flex items-center gap-1.5 leading-snug"
                  >
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-700 animate-pulse" />
                    <span>Nenhum em "{activeCatalogCategory}". Buscado no catálogo geral!</span>
                  </motion.div>
                )}

                {catalogSearchMode === 'online' && onlineError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-2 leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{onlineError} Tentando scrapers e logs automáticos do Radar Comercial.</span>
                  </motion.div>
                )}
              </div>

              {/* Dynamic Categories Scroll Pills (Only for Local catalog) */}
              {catalogSearchMode === 'local' && (
                <div className="flex flex-wrap gap-1 bg-stone-50/50 p-1 rounded-xl border border-stone-200/50 select-none">
                  {uniqueCategories.map(cat => (
                    <Button
                      key={cat}
                      variant="ghost"
                      onClick={() => setActiveCatalogCategory(cat)}
                      className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 h-auto rounded-lg transition-all border-none ${
                        activeCatalogCategory === cat 
                          ? 'bg-amber-700 text-white hover:bg-amber-800 shadow-xs'
                          : 'text-stone-500 hover:text-stone-1000'
                      }`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )}

              {/* PRODUCTS LIST */}
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {(catalogSearchMode === 'local' ? filteredCatalogQuery : mappedOnlineProducts).map((p) => {
                  const isExpanded = expandedProductSpecs[p.id] || false;
                  const isInCart = selectedItems.some(i => i.productId === p.id);

                  return (
                    <motion.div 
                      key={p.id}
                      layout
                      className="border border-stone-200 rounded-2xl p-3 bg-white hover:border-amber-700/25 transition-all group shadow-2xs"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.nickname} 
                          className="w-14 h-14 rounded-xl object-cover bg-stone-50 shrink-0 border border-stone-100" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Suppress broken images with gorgeous default placeholder fallback
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[7.5px] font-black text-amber-800 bg-amber-55/10 rounded px-1.5 py-0.5 uppercase tracking-wider">
                              {p.category}
                            </span>
                            <span className="text-xs font-black font-mono text-stone-900 shrink-0">
                              {p.price > 0 ? formatCurrency(p.price) : 'Sob Consulta'}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-stone-950 uppercase truncate tracking-tight mt-1 leading-snug group-hover:text-amber-800 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-[10px] text-stone-500 leading-none mt-1 font-medium select-none">
                            CÓD: <strong className="text-[#1c1917] font-mono">{p.code}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Item footer expand tools */}
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={() => toggleProductSpecs(p.id)}
                          className="text-[9px] font-bold text-stone-400 hover:text-stone-1000 flex items-center gap-1 uppercase tracking-widest transition-colors select-none bg-transparent hover:bg-transparent p-0 border-none h-auto"
                        >
                          <Info className="w-3.5 h-3.5 text-amber-700/80" /> Especificações
                          {isExpanded ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />}
                        </Button>

                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleQuickAutofillProduct(p)}
                            className="h-7 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[8px] font-black uppercase tracking-wider px-2 border border-stone-200 transition-all"
                            title="Preencher direto os inputs de texto"
                          >
                            Preencher
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleAddProductToCart(p)}
                            className={`h-7 text-xs rounded-lg text-[8px] font-black uppercase tracking-wider px-2.5 flex items-center gap-1 transition-all border-none ${
                              isInCart 
                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-stone-900 text-white hover:bg-stone-850'
                            }`}
                          >
                            {isInCart ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-amber-300" />}
                            {isInCart ? 'Adicionado' : 'Add Carrinho'}
                          </Button>
                        </div>
                      </div>

                      {/* Technical specifications panel details collapsible */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2.5 text-[9.5px] text-stone-500 bg-stone-50 p-2.5 rounded-xl space-y-1.5 leading-relaxed font-sans font-medium border border-stone-100"
                          >
                            <p><strong className="text-stone-900">Sobre:</strong> {p.description}</p>
                            <p><strong className="text-stone-900">Dimensões/Atributos:</strong> {p.specifications}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {((catalogSearchMode === 'local' ? filteredCatalogQuery : mappedOnlineProducts).length === 0) && (
                  <div className="py-12 text-center text-stone-400 font-semibold select-none">
                    <HelpCircle className="w-10 h-10 mx-auto mb-2 text-stone-200" />
                    {catalogSearchMode === 'local' ? (
                      <>
                        <p className="text-xs uppercase">Móvel não catalogado</p>
                        <p className="text-[10px] text-stone-400 mt-1">Refine o termo digitado ou use cadastro manual.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs uppercase">Sem resultados online</p>
                        <p className="text-[10px] text-stone-400 mt-1">Digite um termo no campo de pesquisa para buscar no e-commerce.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    );
  };


  // ==========================================
  // VIEW RENDER 3: FOLLOW-UP MANAGEMENT (CARDS)
  // ==========================================
  const renderSalespersonFollowup = () => {
    return (
      <div className="space-y-6">
        
        {/* Dynamic Warning Alert for follow-ups list */}
        {quotesNeedingAttention.length > 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-[#b45309]/5 border border-amber-600/20 rounded-3xl flex items-center gap-5 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
               <h3 className="text-sm font-black text-amber-800 uppercase tracking-wide">Atenção Especial Necessária</h3>
               <p className="text-xs text-stone-500 font-semibold mt-0.5">Você possui {quotesNeedingAttention.length} propostas cujos retornos ao cliente estão previstos para hoje ou já ultrapassaram o vencimento.</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-2 select-none">
          <div>
            <h2 className="text-xl font-black italic uppercase text-stone-900 tracking-tight">Meus Atendimentos Comerciais</h2>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Gestão de contatos em andamento e faturamentos concluídos.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Badge className="bg-stone-200 text-stone-800 border-none font-bold py-1 px-3 h-8 flex items-center shrink-0">
              Total cadastrado: {myQuotes.length}
            </Badge>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-8 border-stone-200 hover:border-amber-700/50 hover:bg-stone-50 font-black text-[10px] uppercase tracking-wider gap-1.5 rounded-lg text-stone-700 transition-all shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-stone-500" />
              <span>Exportar lista</span>
            </Button>
          </div>
        </div>

        {/* Segmented Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x select-none border-b border-stone-105/40 pt-1">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`text-[9.5px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
              selectedStatusFilter === 'all'
                ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                : 'bg-white border-stone-200/80 text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            }`}
          >
            <span>Todos</span>
            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold ${selectedStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {myQuotes.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('pending')}
            className={`text-[9.5px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
              selectedStatusFilter === 'pending'
                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                : 'bg-white border-stone-200/80 text-amber-800 hover:bg-amber-50/50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selectedStatusFilter === 'pending' ? 'bg-white animate-pulse' : 'bg-amber-500'}`} />
            <span>Negociação Ativa</span>
            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold ${selectedStatusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
              {pendingQuotes.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('won')}
            className={`text-[9.5px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
              selectedStatusFilter === 'won'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-stone-200/80 text-emerald-850 hover:bg-emerald-50/50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selectedStatusFilter === 'won' ? 'bg-white' : 'bg-emerald-550'}`} />
            <span>Ganhos (Vendas)</span>
            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold ${selectedStatusFilter === 'won' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
              {wonQuotes.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('lost')}
            className={`text-[9.5px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border shrink-0 transition-all cursor-pointer flex items-center gap-2.5 ${
              selectedStatusFilter === 'lost'
                ? 'bg-stone-500 border-stone-500 text-white shadow-xs'
                : 'bg-white border-stone-200/80 text-stone-550 hover:bg-stone-50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selectedStatusFilter === 'lost' ? 'bg-white' : 'bg-stone-400'}`} />
            <span>Perdidos</span>
            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold ${selectedStatusFilter === 'lost' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {lostQuotes.length}
            </span>
          </button>
        </div>

        {/* Dashboard Grid list of sales pipelines card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQuotes.map(quote => {
            const isOverdue = quote.status === 'pending' && new Date(quote.returnDate).getTime() <= today.getTime();
            const countItemsTotal = quote.items ? quote.items.reduce((acc, i) => acc + i.quantity, 0) : 1;
            
            return (
              <motion.div 
                key={quote.id} 
                whileHover={{ y: -4 }} 
                className="h-full"
              >
                <Card className={`glass-card border-none relative overflow-hidden flex flex-col h-full bg-white shadow-xs ${
                  isOverdue ? 'ring-2 ring-rose-500/20' : ''
                }`}>
                  
                  {isOverdue && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-600"></div>
                  )}

                  <CardHeader className="pb-3 border-b border-stone-100">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Dono do Orçamento</span>
                        <CardTitle className="text-md font-black text-stone-900 tracking-tight uppercase truncate">{quote.clientName}</CardTitle>
                      </div>
                      
                      <Badge className={`uppercase text-[8px] font-black tracking-widest border-none py-1 px-2.5 shadow-2xs ${
                        quote.status === 'won' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : quote.status === 'lost' 
                            ? 'bg-stone-200 text-stone-500' 
                            : isOverdue 
                              ? 'bg-rose-100 text-rose-800 animate-pulse' 
                              : 'bg-amber-100 text-amber-800'
                      }`}>
                        {quote.status === 'won' ? 'GANHO (VENDA)' : quote.status === 'lost' ? 'PERDIDO' : isOverdue ? 'URGENTE CONTATO' : 'NEGOCIAÇÃO'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1 space-y-4">
                    {/* Summary lists of items purchased */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex justify-between">
                        <span>Produtos Selecionados ({countItemsTotal})</span>
                        <span className="text-amber-800 font-mono">ID: #{quote.id.substring(0,6)}</span>
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate uppercase mt-1 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${quote.status === 'won' ? 'bg-emerald-500' : 'bg-amber-600'}`}></div>
                        <span className="truncate">{quote.productInterest || "Atendimento Geral"}</span>
                      </div>
                      {quote.notes && (
                        <p className="text-[9.5px] text-stone-400 italic truncate mt-1">Obs: {quote.notes}</p>
                      )}
                    </div>

                    {/* Timeline dates widget */}
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-stone-400 uppercase tracking-wider text-[9px]">Data do Retorno</span>
                       <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                         isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'
                       }`}>
                         <Calendar className="w-3.5 h-3.5" />
                         {formatLocalDate(quote.returnDate)}
                       </div>
                    </div>

                    {/* Value pipeline summation */}
                    <div className="flex justify-between items-end border-t border-stone-100 pt-3">
                       <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Montante Financeiro</span>
                       <div className="text-xl font-black text-stone-900 tracking-tight font-mono">
                         {formatCurrency(quote.value)}
                       </div>
                    </div>

                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-0 pb-4">
                    
                    {/* Action buttons triggers */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {/* WhatsApp manual follow up trigger link */}
                      <Button 
                        type="button"
                        className="h-10 text-[9px] rounded-lg bg-[#25D366] hover:bg-[#20bd5a] border-none text-white font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                        onClick={() => {
                          const msg = `🎯 *RADARCONQUISTA* 🎯\n\nOlá *${quote.clientName}*! \nAqui é o consultor *${currentUser.name}* da RadarConquista.\nEstou passando para dar sequência ao atendimento do orçamento *#${quote.id.substring(0,6)}*:\n\n• *Produtos:* ${quote.productInterest}\n💵 *Valor:* ${formatCurrency(quote.value)}\n\nGostaria de saber se ficou com alguma dúvida sobre as formas de pagamento ou entrega rápida que conversamos? \nFico à total disposição de vocês!`;
                          window.open(generateWhatsAppLink(quote.clientPhone, msg), '_blank');
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </Button>

                      {/* PDF download reprint */}
                      <Button 
                        type="button"
                        variant="outline"
                        className="h-10 text-[9px] rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
                        onClick={() => handleDownloadExistingPDF(quote)}
                      >
                        <FileDown className="w-3.5 h-3.5 text-amber-700" /> Imprimir PDF
                      </Button>
                    </div>

                    {/* Change Quote Status Select Trigger */}
                    <select
                      value={quote.status}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateQuoteStatus(quote.id, val as QuoteStatus);
                        toast.success(`Atendimento alterado para: ${
                          val === 'won' ? 'GANHO (CONVERTIDO)' : val === 'lost' ? 'PERDIDO (DESISTÊNCIA)' : 'ABERTO EM NEGOCIAÇÃO'
                        }`);
                      }}
                      className="w-full h-9 rounded-lg border border-stone-200 bg-stone-50 px-2 text-[9px] font-bold uppercase tracking-wider hover:bg-stone-100 transition-all text-stone-800 outline-none focus:border-amber-700/30 focus:ring-0 focus:outline-none cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="pending">Negociação Ativa (Aberto)</option>
                      <option value="won">🔥 Fechou Pedido! (VENDA REALIZADA)</option>
                      <option value="lost">❌ Perdido (Desistência/Cliente Desistiu)</option>
                    </select>
                  </CardFooter>

                </Card>
              </motion.div>
            );
          })}

          {displayedQuotes.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-stone-200 rounded-3xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mb-4 text-stone-300 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-md font-black text-stone-900 uppercase">
                {selectedStatusFilter === 'all' ? 'Sem atendimentos registrados' : 'Nenhum atendimento encontrado'}
              </h3>
              <p className="text-xs text-stone-400 font-medium max-w-sm mt-1 leading-relaxed px-4">
                {selectedStatusFilter === 'all'
                  ? 'Você ainda não possui atendimentos criados. Comece criando um novo orçamento na seção "Novo Orçamento"!'
                  : `Nenhum atendimento na fase de "${
                      selectedStatusFilter === 'pending'
                        ? 'Negociação Ativa'
                        : selectedStatusFilter === 'won'
                          ? 'Ganho (Venda)'
                          : 'Perdido (Desistência)'
                    }" no seu histórico.`}
              </p>
            </div>
          )}
        </div>

      </div>
    );
  };


  // ==========================================
  // VIEW RENDER 4: SIMULATOR INSTALLMENTS
  // ==========================================
  const renderSalespersonSimulator = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: mathematical parameters config (Cols 5) */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="glass-card bg-white border-none pb-4">
            <CardHeader className="border-b border-stone-100 pb-5">
              <CardTitle className="text-lg font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-700" /> Simulador de Parcelas
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 font-bold leading-relaxed">
                Configure parcelamentos sem juros em cartão ou carnês corrigidos por boleto com taxas negociadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              
              {/* Numeric Simulation valuation input */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Valor a ser Financiado (R$)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs font-mono">R$</span>
                  <Input 
                    type="number" 
                    step="0.01"
                    className="bg-white h-11 pl-10 rounded-xl border-stone-200 text-sm font-black text-stone-900 placeholder:text-stone-300"
                    placeholder="Ex: 2490,00"
                    value={customSimulatedAmount}
                    onChange={(e) => setCustomSimulatedAmount(e.target.value)}
                  />
                </div>
                {selectedItems.length > 0 && (
                  <Button 
                    type="button"
                    variant="link"
                    onClick={() => {
                      const cartTotal = selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                      setCustomSimulatedAmount(cartTotal.toString());
                    }}
                    className="text-[9px] text-[#b45309] hover:underline font-bold uppercase tracking-wider ml-1 block p-0 h-auto border-none underline-none hover:no-underline"
                  >
                    Usar valor total do carrinho atual ({formatCurrency(selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0))})
                  </Button>
                )}
              </div>

              {/* Installment count choose */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">Limite Máximo de Parcelas</Label>
                <select
                  value={installmentsCount.toString()}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-800 outline-none focus:border-amber-700/50 focus:ring-0 focus:outline-none transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="3">Até 3 Parcelas</option>
                  <option value="6">Até 6 Parcelas</option>
                  <option value="10">Até 10 Parcelas Sem Juros</option>
                  <option value="12">Até 12 Parcelas (Corporativo)</option>
                  <option value="18">Até 18 Parcelas (Especial Carnê)</option>
                  <option value="24">Até 24 Parcelas (Financiamento)</option>
                </select>
              </div>

              {/* System Payment method chooser */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-1 rounded-xl border border-stone-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setInterestType('no_interest');
                    setMonthlyInterestRate(0);
                  }}
                  className={`py-2 text-[10px] h-auto uppercase font-black tracking-wider rounded-lg transition-all border-none ${
                    interestType === 'no_interest' 
                      ? 'bg-amber-700 text-white shadow-xs hover:bg-amber-800' 
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  💳 Cartão (Sem Juros)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setInterestType('with_interest');
                    setMonthlyInterestRate(1.99); // standard retail rate
                  }}
                  className={`py-2 text-[10px] h-auto uppercase font-black tracking-wider rounded-lg transition-all border-none ${
                    interestType === 'with_interest' 
                      ? 'bg-amber-700 text-white shadow-xs hover:bg-amber-800' 
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  📝 Carnê / Boleto
                </Button>
              </div>

              {/* Dynamic Interest Rate inputs slider for Carnê simulation */}
              {interestType === 'with_interest' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="space-y-2 border-t border-stone-100 pt-4"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-stone-500 ml-1">
                    <span>Taxa Mensal Negociada:</span>
                    <span className="text-amber-800 font-black text-xs font-mono">{monthlyInterestRate}% /mês</span>
                  </div>
                  <Input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.05"
                    value={monthlyInterestRate} 
                    onChange={(e) => setMonthlyInterestRate(parseFloat(e.target.value))}
                    className="accent-amber-75 h-1.5"
                  />
                  <div className="flex justify-between text-[8px] text-stone-400 uppercase font-black">
                    <span>0% (Sem Juros)</span>
                    <span>2.5% (Eletros)</span>
                    <span>5.0% (Alto Risco)</span>
                  </div>
                </motion.div>
              )}

            </CardContent>
            
            {currentSimulatedValue > 0 && (
              <CardFooter className="pt-2 border-t border-stone-100 bg-stone-50 flex flex-col gap-2">
                <Button 
                  type="button"
                  onClick={handleCopySimulationToClipboard}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-stone-900 border border-stone-950 text-white hover:bg-stone-850"
                >
                  <Copy className="w-4 h-4 text-amber-300" /> Copiar para WhatsApp
                </Button>
                <p className="text-[8px] text-stone-400 font-semibold text-center mt-1">* Formata o parcelamento perfeitamente para colar direto em conversas.</p>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right pane: dynamic calculations display table index lists (Cols 7) */}
        <div className="xl:col-span-7">
          <Card className="glass-card border-none overflow-hidden bg-white shadow-xs">
            <CardHeader className="border-b border-stone-100 pb-5">
              <CardTitle className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-700" /> Tabela Nominal de Parcelamentos
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 font-bold leading-relaxed">
                Tabela de projeção com parcelas exaustivas para negociação direta em showroom.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              
              {currentSimulatedValue <= 0 ? (
                <div className="py-20 text-center text-stone-400 font-semibold select-none">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-25 text-amber-75" />
                  <p className="text-xs uppercase">Digite um valor para simular</p>
                  <p className="text-[10px] text-stone-400 font-medium max-w-xs mx-auto mt-1 leading-relaxed">Defina um montante financeiro no editor ao lado para renderizar a tabela com coeficiente bancário RadarConquista.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  <div className="grid grid-cols-12 bg-stone-50 p-3 text-[9px] font-black uppercase text-stone-400 tracking-widest text-center">
                    <span className="col-span-2 text-left pl-3">Parcela</span>
                    <span className="col-span-3">Prestação</span>
                    <span className="col-span-4">Valor Total Final</span>
                    <span className="col-span-3">Juros Acumulados</span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-stone-100">
                    {simulatedInstallments.map((inst) => {
                      const cumulativeInterest = inst.totalValue - currentSimulatedValue;
                      return (
                        <div key={inst.number} className="grid grid-cols-12 p-3 text-xs items-center text-center font-bold text-stone-800 hover:bg-stone-50 transition-all">
                          <span className="col-span-2 text-left pl-3 font-extrabold text-stone-950 font-mono">
                            {inst.number}x
                          </span>
                          <span className="col-span-3 text-amber-800 font-black font-mono">
                            {formatCurrency(inst.installmentValue)}
                          </span>
                          <span className="col-span-4 text-stone-900 font-extrabold font-mono">
                            {formatCurrency(inst.totalValue)}
                          </span>
                          <span className={`col-span-3 font-bold font-mono text-[10.5px] ${
                            cumulativeInterest > 0 ? 'text-rose-600' : 'text-stone-400'
                          }`}>
                            {cumulativeInterest > 0 ? `+ ${formatCurrency(cumulativeInterest)}` : 'Isento'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    );
  };


  // ==========================================
  // SYSTEM GENERAL COMPONENT SCREEN COORDINATION
  // ==========================================
  return (
    <div className="space-y-6 pb-16">
      
      {/* Brand Elegant Header Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1c1917]/5"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 py-0.5 px-2 bg-amber-500/10 rounded-lg border border-amber-550/10">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></div>
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest select-none">
              RadarConquista | radarconquista.com.br
            </span>
          </div>

          {/* Intelligent Audio Reminder System Widgets */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 p-1 rounded-xl">
            {/* Urgent badge of soon return list */}
            <div 
              onClick={() => {
                if (quotesNearReturn.length > 0) setActiveTab('followup');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                quotesNearReturn.length > 0 
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-stone-200/60 text-stone-500'
              }`}
            >
              <Bell className="w-3 h-3" />
              <span>{quotesNearReturn.length} Retornos Próximos</span>
            </div>

            {/* Sound Enable/Mute control */}
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => {
                const updated = !soundEnabled;
                setSoundEnabled(updated);
                toast.success(updated ? '🔔 Alertas sonorizados ativos!' : '🔇 Alertas de retorno silenciados!');
                if (updated) {
                  // Promptly play helper to test sound
                  setTimeout(() => {
                    try {
                      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                      const ctx = new AudioContext();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.frequency.value = 587.33; // D5
                      gain.gain.setValueAtTime(0.08, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.3);
                    } catch {}
                  }, 100);
                }
              }}
              className="h-6 w-6 rounded-lg text-stone-550 hover:bg-stone-200/50 hover:text-stone-850"
              title={soundEnabled ? "Silenciar Alertas Sonoros" : "Ativar Alertas Sonoros"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
            </Button>

            {/* Manual sound test trigger (resolves autoplay lock as user gesture!) */}
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                playNotificationChime();
                toast.success('📢 Teste de Som disparado! Seus alertas automáticos estão prontos.');
              }}
              className="h-6 text-[8.5px] font-black border-stone-200 hover:border-amber-700/30 font-mono uppercase tracking-wider px-2 py-1 rounded-lg text-stone-600 hover:text-amber-900 bg-white shadow-3xs"
            >
              Testar Som
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-[9.5px] text-stone-400 font-bold select-none font-sans">
          <Clock className="w-3.5 h-3.5 text-stone-400" /> Atualizado: Hoje, às {today.toLocaleDateString('pt-BR')}
        </div>
      </motion.div>

      {/* Salesperson Personalized Warm Welcoming Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 md:p-8 rounded-[2rem] bg-stone-900 text-white relative overflow-hidden shadow-md"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
          <UserCircle2 className="w-56 h-56 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#b45309] p-1 px-2.5 bg-amber-450/10 rounded-full border border-amber-450/20">
              Painel do Consultor Ativo
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
              Olá, <span className="text-amber-500 font-bold">{currentUser.name}</span>! 🚀
            </h1>
            <p className="text-xs text-stone-300 font-medium max-w-xl">
              Seu painel comercial está pronto. Gerencie seus orçamentos, faça o follow-up nos momentos certos e atinja a sua classificação de comissão!
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <div className="bg-white/8 rounded-2xl p-3 px-4 border border-white/6 text-right">
              <span className="block text-[8.5px] font-black uppercase tracking-widest text-stone-400">Minha Unidade</span>
              <span className="text-sm font-black text-white">{myBranch?.name || myLegacyBranch?.name || 'Showroom Matriz'}</span>
            </div>
            
            <div className="bg-white/8 rounded-2xl p-3 px-4 border border-white/6 text-right">
              <span className="block text-[8.5px] font-black uppercase tracking-widest text-stone-400">Status Indicador</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Vendedor Ativo
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RENDER ACTIVE TAB SCENARIOS */}
      {activeTab === 'home' && renderSalespersonHome()}
      {activeTab === 'new_quote' && renderSalespersonNewQuote()}
      {activeTab === 'followup' && renderSalespersonFollowup()}
      {activeTab === 'simulator' && renderSalespersonSimulator()}

    </div>
  );
};
