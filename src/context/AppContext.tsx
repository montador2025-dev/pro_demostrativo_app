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
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Branches
  addBranch: (name: string) => void;
  updateBranch: (id: string, name: string) => void;
  deleteBranch: (id: string) => void;
  // Users
  addUser: (name: string, role: Role, branchId?: string, phone?: string) => void;
  updateUser: (id: string, name: string, phone?: string) => void;
  deleteUser: (id: string) => void;
  transferUser: (userId: string, newBranchId: string) => void;
  reassignQuotes: (oldUserId: string, newUserId: string) => void;
  // Quotes
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
}

const mockBranches: Branch[] = [
  { id: 'b1', name: 'Filial Centro (01)', createdAt: new Date().toISOString() },
  { id: 'b2', name: 'Filial Shopping Norte (02)', createdAt: new Date().toISOString() },
];

const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos', role: 'supervisor', phone: '(21) 99999-1111', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'Ana', role: 'manager', branchId: 'b1', phone: '(21) 98888-2222', createdAt: new Date().toISOString() },
  { id: 'u3', name: 'Roberto', role: 'salesperson', branchId: 'b1', phone: '(21) 97777-3333', createdAt: new Date().toISOString() },
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
        // Force upgrade users to clean names and phone numbers
        if (parsed && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u: any) => {
            const cleanName = u.name
              .replace(/\s*\(Vendedor\s+Centro\)/i, '')
              .replace(/\s*\(Gerente\s+Centro\)/i, '')
              .replace(/\s*\(Supervisor\s+Geral\)/i, '');
            let phone = u.phone;
            if (!phone) {
              phone = u.role === 'supervisor' ? '(21) 99999-1111' : u.role === 'manager' ? '(21) 98888-2222' : '(21) 97777-3333';
            }
            return { ...u, name: cleanName, phone };
          });
        }
        if (parsed && parsed.currentUser) {
          const cleanName = parsed.currentUser.name
            .replace(/\s*\(Vendedor\s+Centro\)/i, '')
            .replace(/\s*\(Gerente\s+Centro\)/i, '')
            .replace(/\s*\(Supervisor\s+Geral\)/i, '');
          let phone = parsed.currentUser.phone;
          if (!phone) {
            phone = parsed.currentUser.role === 'supervisor' ? '(21) 99999-1111' : parsed.currentUser.role === 'manager' ? '(21) 98888-2222' : '(21) 97777-3333';
          }
          parsed.currentUser = { ...parsed.currentUser, name: cleanName, phone };
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse appState, reverting to default mocks", e);
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

  useEffect(() => {
    // Automated Access Tracking
    if (state.currentUser) {
      const now = new Date().toISOString();
      setState(s => ({
        ...s,
        users: s.users.map(u => u.id === s.currentUser?.id ? { ...u, lastAccess: now } : u),
        currentUser: s.currentUser ? { ...s.currentUser, lastAccess: now } : null
      }));
    }
  }, []); // Run once on initialization

  const [activeTab, setActiveTab] = useState('home');

  const setCurrentUser = (user: User | null) => {
    setState(s => ({ ...s, currentUser: user }));
    // Reset back to home when changing users
    setActiveTab('home');
  };

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

  const addUser = (name: string, role: Role, branchId?: string, phone?: string) => {
    const newUser: User = { 
      id: uuidv4(), 
      name, 
      role, 
      branchId, 
      phone: phone || '(21) 99999-9999', 
      createdAt: new Date().toISOString() 
    };
    setState(s => ({ ...s, users: [...s.users, newUser] }));
  };

  const updateUser = (id: string, name: string, phone?: string) => {
    setState(s => ({ 
      ...s, 
      users: s.users.map(u => u.id === id ? { ...u, name, phone: phone !== undefined ? phone : u.phone } : u),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, name, phone: phone !== undefined ? phone : s.currentUser.phone } : s.currentUser
    }));
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

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setState(s => {
      const quotes = s.quotes.map(q => q.id === id ? { ...q, status } : q);
      return { ...s, quotes };
    });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentUser,
      activeTab,
      setActiveTab,
      addBranch,
      updateBranch,
      deleteBranch,
      addUser,
      updateUser,
      deleteUser,
      transferUser,
      reassignQuotes,
      addQuote,
      updateQuoteStatus
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
