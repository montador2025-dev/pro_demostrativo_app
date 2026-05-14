import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Branch, User, Quote, Role } from '../types';

interface AppState {
  branches: Branch[];
  users: User[];
  quotes: Quote[];
  currentUser: User | null;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  // Branches
  addBranch: (name: string) => void;
  updateBranch: (id: string, name: string) => void;
  deleteBranch: (id: string) => void;
  // Users
  addUser: (name: string, role: Role, branchId?: string) => void;
  updateUser: (id: string, name: string) => void;
  deleteUser: (id: string) => void;
  transferUser: (userId: string, newBranchId: string) => void;
  reassignQuotes: (oldUserId: string, newUserId: string) => void;
  // Quotes
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  deleteQuote: (id: string) => void;
}

const mockBranches: Branch[] = [
  { id: 'b1', name: 'Filial Centro (01)', createdAt: new Date().toISOString() },
  { id: 'b2', name: 'Filial Shopping Norte (02)', createdAt: new Date().toISOString() },
];

const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos (Supervisor Geral)', role: 'supervisor', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'Ana (Gerente Centro)', role: 'manager', branchId: 'b1', createdAt: new Date().toISOString() },
  { id: 'u3', name: 'Roberto (Vendedor Centro)', role: 'salesperson', branchId: 'b1', createdAt: new Date().toISOString() },
];

const mockQuotes: Quote[] = [
  {
    id: 'q1',
    clientName: 'Maria Silva',
    clientPhone: '11988887777',
    productInterest: 'Guarda-roupa Casal com Espelho',
    value: 4500.00,
    category: 'card_turning',
    returnDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    status: 'pending',
    createdBy: 'u3',
    branchId: 'b1',
    createdAt: new Date().toISOString()
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Try to load from localStorage, else use mocks
    const saved = localStorage.getItem('appState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed) return {
          branches: mockBranches,
          users: mockUsers,
          quotes: mockQuotes,
          currentUser: mockUsers[0],
        };
        const hasValidUser = parsed.currentUser && typeof parsed.currentUser.id === 'string' && typeof parsed.currentUser.role === 'string';
        return {
          branches: parsed.branches || mockBranches,
          users: parsed.users || mockUsers,
          quotes: parsed.quotes || mockQuotes,
          currentUser: hasValidUser ? parsed.currentUser : mockUsers[0],
        };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return {
      branches: mockBranches,
      users: mockUsers,
      quotes: mockQuotes,
      currentUser: mockUsers[0],
    };
  });

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  const setCurrentUser = (user: User | null) => setState(s => ({ ...s, currentUser: user }));

  const addBranch = (name: string) => {
    const newBranch: Branch = { id: uuidv4(), name, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, branches: [...s.branches, newBranch] }));
  };

  const updateBranch = (id: string, name: string) => {
    setState(s => ({ ...s, branches: s.branches.map(b => b.id === id ? { ...b, name } : b) }));
  };

  const deleteBranch = (id: string) => {
    setState(s => ({ ...s, branches: s.branches.filter(b => b.id !== id) }));
  };

  const addUser = (name: string, role: Role, branchId?: string) => {
    const newUser: User = { id: uuidv4(), name, role, branchId, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, users: [...s.users, newUser] }));
  };

  const updateUser = (id: string, name: string) => {
    setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, name } : u) }));
  };

  const deleteUser = (id: string) => {
    setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
  };

  const transferUser = (userId: string, newBranchId: string) => {
    setState(s => {
      const users = s.users.map(u => {
        if (u.id === userId) {
          return { ...u, branchId: newBranchId, lastBranchId: u.branchId };
        }
        return u;
      });
      // Also mark existing pending quotes as 'transferred' so they keep belonging to the old branch
      const quotes = s.quotes.map(q => {
        if (q.createdBy === userId && q.status === 'pending') {
          return { ...q, isTransferred: true };
        }
        return q;
      });
      return { ...s, users, quotes };
    });
  };

  const reassignQuotes = (oldUserId: string, newUserId: string) => {
    setState(s => {
      const quotes = s.quotes.map(q => {
        if (q.createdBy === oldUserId && q.status === 'pending') {
          return { ...q, createdBy: newUserId };
        }
        return q;
      });
      return { ...s, quotes };
    });
  };

  const addQuote = (quoteInput: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: Quote = {
      ...quoteInput,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, quotes: [...s.quotes, newQuote] }));
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setState(s => ({
      ...s,
      quotes: s.quotes.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setState(s => {
      const quotes = s.quotes.map(q => q.id === id ? { ...q, status } : q);
      return { ...s, quotes };
    });
  };

  const deleteQuote = (id: string) => {
    setState(s => ({
      ...s,
      quotes: s.quotes.filter(q => q.id !== id)
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentUser,
      addBranch,
      updateBranch,
      deleteBranch,
      addUser,
      updateUser,
      deleteUser,
      transferUser,
      reassignQuotes,
      addQuote,
      updateQuote,
      updateQuoteStatus,
      deleteQuote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
