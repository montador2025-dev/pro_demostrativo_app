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
