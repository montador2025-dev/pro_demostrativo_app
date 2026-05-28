export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const amount = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const parseCurrencyInput = (formattedValue: string) => {
  const digits = formattedValue.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

export const formatPhone = (phone: string) => {
   const cleaned = ('' + phone).replace(/\D/g, '');
   let match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
   if (match) {
     return `(${match[1]}) ${match[2]}-${match[3]}`;
   }
   return phone;
};

// WhatsApp link generator
export const generateWhatsAppLink = (phone: string, message: string) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const prefix = cleaned.length <= 11 ? '55' : ''; // add Brazil code if not present
  return `https://wa.me/${prefix}${cleaned}?text=${encodeURIComponent(message)}`;
};

// Conversor de data de acesso para tempo decorrido amigável (Português)
export const formatTimeAgo = (isoString?: string): string => {
  if (!isoString) return 'Nunca acessou';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) return 'Online agora'; // Para prevenir inconsistências pequenas de relógio server-client
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Online';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours} h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

