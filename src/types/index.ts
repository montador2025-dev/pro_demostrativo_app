export type Role = 'supervisor' | 'manager' | 'salesperson';

export type QuoteCategory = 
  | 'card_turning' // virada de cartão
  | 'researching'  // pesquisando
  | 'price_high'   // achou caro
  | 'needs_spouse' // precisa falar com cônjuge
  | 'other';       // outro

export type QuoteStatus = 'pending' | 'won' | 'lost';

export interface Branch {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  branchId?: string; // Managers and Salespeople belong to a branch
  lastBranchId?: string; // Keep track of the last branch for transferred salespeople
  createdAt: string;
}

export interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  productInterest: string;
  value: number;
  category: QuoteCategory;
  customCategoryReason?: string;
  returnDate: string; // ISO string
  status: QuoteStatus;
  
  createdBy: string; // User ID (salesperson)
  branchId: string; // Branch ID at the time the quote was created
  isTransferred?: boolean; // True if this quote belongs to a legacy branch for the user
  
  createdAt: string;
}
