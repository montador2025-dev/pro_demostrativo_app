import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Branch, User, Quote, Role, Company, AuditLog } from '../types';

interface AppState {
  branches: Branch[];
  users: User[];
  quotes: Quote[];
  currentUser: User | null;
  currentCompany: Company;
  auditLogs: AuditLog[];
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
  // SaaS and Security
  addAuditLog: (action: string, status?: AuditLog['status']) => void;
  updateCompanySettings: (name: string, plan: string) => void;
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
    const defaultCompany: Company = {
      id: 'c1',
      name: 'Grupo Sono Show Móveis S.A.',
      plan: 'Enterprise SaaS Corporate Plus',
      maxUsers: 150,
      licenseExpires: '2028-05-25T12:00:00Z'
    };
    const defaultAuditLogs: AuditLog[] = [
      { id: 'l1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), userId: 'u1', userName: 'Carlos', role: 'supervisor', action: 'Políticas de controle de privilégios e auditoria de sessão SaaS implantadas', ipAddress: '186.205.112.5', status: 'SUCCESS' },
      { id: 'l2', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), userId: 'u1', userName: 'Carlos', role: 'supervisor', action: 'Varredura e indexação de dados do Firestore simulada', ipAddress: '186.205.112.5', status: 'SUCCESS' },
      { id: 'l3', timestamp: new Date().toISOString(), userId: 'u1', userName: 'Carlos', role: 'supervisor', action: 'Sessão administrativa ativada com segurança baseada em token', ipAddress: '186.205.112.5', status: 'SUCCESS' }
    ];

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
        if (!parsed.currentCompany) {
          parsed.currentCompany = defaultCompany;
        }
        if (!parsed.auditLogs) {
          parsed.auditLogs = defaultAuditLogs;
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
      currentCompany: defaultCompany,
      auditLogs: defaultAuditLogs,
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

  const addAuditLog = (action: string, status: AuditLog['status'] = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: state.currentUser?.id || 'anonymous',
      userName: state.currentUser?.name || 'Sistema',
      role: state.currentUser?.role || 'system',
      action,
      ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
      status
    };
    setState(s => ({
      ...s,
      auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
    }));
  };

  const updateCompanySettings = (name: string, plan: string) => {
    setState(s => {
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'anonymous',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Parâmetros SaaS Atualizados: ${name} (${plan})`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return {
        ...s,
        currentCompany: {
          ...s.currentCompany,
          name,
          plan
        },
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const setCurrentUser = (user: User | null) => {
    setState(s => {
      const now = new Date().toISOString();
      const actionText = user 
        ? `Acesso concedido: Sessão ativa como ${user.name} (${user.role.toUpperCase()})` 
        : `Sessão encerrada voluntariamente`;
      
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: now,
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Sistema',
        role: user?.role || 'system',
        action: actionText,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: user ? 'SUCCESS' : 'ALERT'
      };

      const updatedUsers = s.users.map(u => u.id === user?.id ? { ...u, lastAccess: now } : u);

      return { 
        ...s, 
        currentUser: user ? { ...user, lastAccess: now } : null,
        users: updatedUsers,
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
    // Reset back to home when changing users
    setActiveTab('home');
  };

  const addBranch = (name: string) => {
    const newBranch: Branch = { id: uuidv4(), name, createdAt: new Date().toISOString() };
    setState(s => {
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Showroom Cadastrado: Nova filial criada - "${name}"`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return {
        ...s,
        branches: [...s.branches, newBranch],
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const updateBranch = (id: string, name: string) => {
    setState(s => {
      const oldBranch = s.branches.find(b => b.id === id);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Showroom Modificado: Filial "${oldBranch?.name || id}" renomeada para "${name}"`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return {
        ...s,
        branches: s.branches.map(b => b.id === id ? { ...b, name } : b),
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const deleteBranch = (id: string) => {
    setState(s => {
      const branch = s.branches.find(b => b.id === id);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `DELEÇÃO OPERACIONAL: Filial "${branch?.name || id}" removida com segurança`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'WARNING'
      };
      return {
        ...s,
        branches: s.branches.filter(b => b.id !== id),
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
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
    setState(s => {
      const branch = s.branches.find(b => b.id === branchId);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Staff Cadastrado: Habilitado acesso para "${name}" como (${role.toUpperCase()}) na filial ${branch?.name || 'Central'}`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return {
        ...s,
        users: [...s.users, newUser],
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const updateUser = (id: string, name: string, phone?: string) => {
    setState(s => {
      const targetUser = s.users.find(u => u.id === id);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Cadastro Retificado: Credenciais de "${targetUser?.name || id}" atualizadas`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return { 
        ...s, 
        users: s.users.map(u => u.id === id ? { ...u, name, phone: phone !== undefined ? phone : u.phone } : u),
        currentUser: s.currentUser?.id === id ? { ...s.currentUser, name, phone: phone !== undefined ? phone : s.currentUser.phone } : s.currentUser,
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const deleteUser = (id: string) => {
    setState(s => {
      const targetUser = s.users.find(u => u.id === id);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Revogação de Credenciais: Staff "${targetUser?.name || id}" desvinculado e excluído com segurança`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'ALERT'
      };
      return { 
        ...s, 
        users: s.users.filter(u => u.id !== id),
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const transferUser = (userId: string, newBranchId: string) => {
    setState(s => {
      const targetUser = s.users.find(u => u.id === userId);
      const oldBranch = s.branches.find(b => b.id === targetUser?.branchId);
      const newBranch = s.branches.find(b => b.id === newBranchId);

      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `TRANSFERÊNCIA GEOGRÁFICA: Alocado consultor "${targetUser?.name}" de "${oldBranch?.name || 'Central'}" para "${newBranch?.name || 'Central'}"`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };

      const users = s.users.map(u => {
        if (u.id === userId) {
          return { ...u, branchId: newBranchId, lastBranchId: u.branchId };
        }
        return u;
      });
      const quotes = s.quotes.map(q => {
        if (q.createdBy === userId && q.status === 'pending') {
          return { ...q, isTransferred: true };
        }
        return q;
      });
      return { ...s, users, quotes, auditLogs: [newLog, ...s.auditLogs].slice(0, 100) };
    });
  };

  const reassignQuotes = (oldUserId: string, newUserId: string) => {
    setState(s => {
      const oldUser = s.users.find(u => u.id === oldUserId);
      const newUser = s.users.find(u => u.id === newUserId);
      
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'system',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `MIGRAÇÃO DE CARTEIRA: Transferidos orçamentos ativos de "${oldUser?.name}" para "${newUser?.name}"`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };

      const quotes = s.quotes.map(q => {
        if (q.createdBy === oldUserId && q.status === 'pending') {
          return { ...q, createdBy: newUserId };
        }
        return q;
      });
      return { ...s, quotes, auditLogs: [newLog, ...s.auditLogs].slice(0, 100) };
    });
  };

  const addQuote = (quoteInput: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: Quote = {
      ...quoteInput,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setState(s => {
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'anonymous',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Proposta Registrada: Orçamento criado para o cliente "${quoteInput.clientName}" no valor de R$ ${quoteInput.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: 'SUCCESS'
      };
      return { 
        ...s, 
        quotes: [...s.quotes, newQuote],
        auditLogs: [newLog, ...s.auditLogs].slice(0, 100)
      };
    });
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setState(s => {
      const quote = s.quotes.find(q => q.id === id);
      const newLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userId: s.currentUser?.id || 'anonymous',
        userName: s.currentUser?.name || 'Sistema',
        role: s.currentUser?.role || 'system',
        action: `Negociação Atualizada: Orçamento de "${quote?.clientName}" alterado para status [${status.toUpperCase()}]`,
        ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
        status: status === 'won' ? 'SUCCESS' : status === 'lost' ? 'ALERT' : 'SUCCESS'
      };
      const quotes = s.quotes.map(q => q.id === id ? { ...q, status } : q);
      return { ...s, quotes, auditLogs: [newLog, ...s.auditLogs].slice(0, 100) };
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
      updateQuoteStatus,
      addAuditLog,
      updateCompanySettings
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
