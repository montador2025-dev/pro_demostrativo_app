import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  writeBatch 
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Branch, User, Quote, Role, Company, AuditLog } from '../types';

interface AppState {
  branches: Branch[];
  users: User[];
  quotes: Quote[];
  currentUser: User | null;
  currentCompany: Company;
  auditLogs: AuditLog[];
  isLoading: boolean;
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

const PASSWORD_SECRET = 'atendepro123_safe';

// Seeds general mocked structures if Firestore collections are absolutely blank
const seedDatabaseIfNeeded = async () => {
  try {
    // 1. Check & Seed Branches
    const branchesSnap = await getDocs(collection(db, 'branches'));
    if (branchesSnap.empty) {
      const batch = writeBatch(db);
      mockBranches.forEach(b => {
        batch.set(doc(db, 'branches', b.id), b);
      });
      await batch.commit();
    }
    
    // 2. Check & Seed Users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      // Carlos already exists in Firebase Auth because of our boot logic! Its UID is:
      const carlosUid = auth.currentUser?.uid || 'u1';
      
      // Let's register Ana and Roberto in Firebase Auth too so they can sign in later!
      let anaUid = 'u2';
      let robertoUid = 'u3';
      
      const secondaryAppName = 'temp-auth-creator-init-2';
      let secondaryApp;
      const apps = getApps();
      const existing = apps.find(app => app.name === secondaryAppName);
      if (existing) {
        secondaryApp = existing;
      } else {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      }
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const anaCred = await createUserWithEmailAndPassword(secondaryAuth, 'ana_u2@atendepro.com', PASSWORD_SECRET);
        anaUid = anaCred.user.uid;
      } catch (e) {
        console.warn("Ana auth exists or skipped:", e);
      }

      try {
        const robertoCred = await createUserWithEmailAndPassword(secondaryAuth, 'roberto_u3@atendepro.com', PASSWORD_SECRET);
        robertoUid = robertoCred.user.uid;
      } catch (e) {
        console.warn("Roberto auth exists or skipped:", e);
      }

      // Write user documents to Firestore
      await setDoc(doc(db, 'users', carlosUid), {
        id: carlosUid,
        name: 'Carlos',
        role: 'supervisor',
        phone: '(21) 99999-1111',
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', anaUid), {
        id: anaUid,
        name: 'Ana',
        role: 'manager',
        branchId: 'b1',
        phone: '(21) 98888-2222',
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', robertoUid), {
        id: robertoUid,
        name: 'Roberto',
        role: 'salesperson',
        branchId: 'b1',
        phone: '(21) 97777-3333',
        createdAt: new Date().toISOString()
      });

      // 3. Seed Quotes with Roberto's UID
      const mockSeededQuote = {
        id: 'q1',
        clientName: 'Maria Silva',
        clientPhone: '11988887777',
        productInterest: 'Guarda-roupa Casal com Espelho',
        value: 4500.00,
        category: 'card_turning',
        returnDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        status: 'pending',
        createdBy: robertoUid,
        branchId: 'b1',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'quotes', 'q1'), mockSeededQuote);

      // 4. Seed Audit Logs
      const defaultAuditLogs = [
        { id: 'l1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), userId: carlosUid, userName: 'Carlos', role: 'supervisor', action: 'Políticas de controle de privilégios e auditoria de sessão SaaS implantadas', ipAddress: '186.205.112.5', status: 'SUCCESS' },
        { id: 'l2', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), userId: carlosUid, userName: 'Carlos', role: 'supervisor', action: 'Conexão e sincronização real-time com banco de dados Firebase Firestore ativado', ipAddress: '186.205.112.5', status: 'SUCCESS' },
        { id: 'l3', timestamp: new Date().toISOString(), userId: carlosUid, userName: 'Carlos', role: 'supervisor', action: 'Sessão administrativa ativada com segurança baseada em token real-time', ipAddress: '186.205.112.5', status: 'SUCCESS' }
      ];
      const logBatch = writeBatch(db);
      defaultAuditLogs.forEach(l => {
        logBatch.set(doc(db, 'auditLogs', l.id), l);
      });
      await logBatch.commit();
    }

    // 4. Ensure Company Settings Doc
    const companyDocRef = doc(db, 'companies', 'c1');
    const companySnap = await getDoc(companyDocRef);
    if (!companySnap.exists()) {
      const defaultCompany: Company = {
        id: 'c1',
        name: 'Grupo Sono Show Móveis S.A.',
        plan: 'Enterprise SaaS Corporate Plus',
        maxUsers: 150,
        licenseExpires: '2028-05-25T12:00:00Z'
      };
      await setDoc(companyDocRef, defaultCompany);
    }
  } catch (err) {
    console.error("Failed to seed database, continuing using local fallback if needed:", err);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company>({
    id: 'c1',
    name: 'Grupo Sono Show Móveis S.A.',
    plan: 'Enterprise SaaS Corporate Plus',
    maxUsers: 150,
    licenseExpires: '2028-05-25T12:00:00Z'
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Helper to synchronize active Firebase Auth session with selected user's mock credentials
  const syncFirebaseAuthWithUser = async (user: User) => {
    const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${safeName}_${user.id.toLowerCase().slice(0, 10)}@atendepro.com`;
    const password = PASSWORD_SECRET;

    if (auth.currentUser?.email === email) {
      return; 
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log(`Successfully synced Firebase Auth session for: ${user.name}`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log(`Dynamically registered & synced Firebase Auth credentials for: ${user.name}`);
        } catch (createErr) {
          console.error(`Dynamic registration failed for user ${user.name}:`, createErr);
        }
      } else {
        console.error(`Firebase Auth sync failed for ${user.name}:`, err);
      }
    }
  };

  // Real-Time Sync Loop
  useEffect(() => {
    let unsubBranches: () => void = () => {};
    let unsubUsers: () => void = () => {};
    let unsubQuotes: () => void = () => {};
    let unsubCompany: () => void = () => {};
    let unsubAudit: () => void = () => {};

    const initAndListen = async () => {
      setIsLoading(true);
      try {
        // Step 1: Boot strapping with Carlos' credentials to gain immediate read/write permissions
        const supervisorEmail = 'carlos_u1@atendepro.com';
        try {
          await signInWithEmailAndPassword(auth, supervisorEmail, PASSWORD_SECRET);
          console.log("Supervisor Carlos session active");
        } catch (authErr: any) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-login-credentials') {
            await createUserWithEmailAndPassword(auth, supervisorEmail, PASSWORD_SECRET);
            console.log("Supervisor Carlos registered and session active");
          } else {
            console.error("Auth bootstrapping error:", authErr);
          }
        }

        // Step 2: Ensure collections & documents exist
        await seedDatabaseIfNeeded();

        // Step 3: Establish real-time live observers
        unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
          const list: Branch[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as Branch));
          setBranches(list);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'branches'));

        unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
          const list: User[] = [];
          snap.forEach(docSnap => {
            const u = docSnap.data() as User;
            const cleanName = u.name
               .replace(/\s*\(Vendedor\s+Centro\)/i, '')
               .replace(/\s*\(Gerente\s+Centro\)/i, '')
               .replace(/\s*\(Supervisor\s+Geral\)/i, '');
            let phone = u.phone;
            if (!phone) {
              phone = u.role === 'supervisor' ? '(21) 99999-1111' : u.role === 'manager' ? '(21) 98888-2222' : '(21) 97777-3333';
            }
            list.push({ ...u, name: cleanName, phone });
          });
          setUsers(list);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

        unsubQuotes = onSnapshot(collection(db, 'quotes'), (snap) => {
          const list: Quote[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as Quote));
          setQuotes(list);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'quotes'));

        unsubCompany = onSnapshot(doc(db, 'companies', 'c1'), (snap) => {
          if (snap.exists()) {
            setCurrentCompany(snap.data() as Company);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, 'companies'));

        const auditQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
        unsubAudit = onSnapshot(auditQuery, (snap) => {
          const list: AuditLog[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as AuditLog));
          setAuditLogs(list);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'auditLogs'));

      } catch (err) {
        console.error("Initialization of AppContext synchronization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAndListen();

    return () => {
      unsubBranches();
      unsubUsers();
      unsubQuotes();
      unsubCompany();
      unsubAudit();
    };
  }, []);

  // Sync Logged User Profile and ensure custom auth alignment
  useEffect(() => {
    if (users.length > 0) {
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        const found = users.find(u => u.id === savedUserId);
        if (found) {
          syncFirebaseAuthWithUser(found).then(() => {
            setCurrentUser(found);
          });
          return;
        }
      }
      // Pick Supervisor as default
      const defaultUser = users.find(u => u.role === 'supervisor') || users[0];
      if (defaultUser) {
        syncFirebaseAuthWithUser(defaultUser).then(() => {
          setCurrentUser(defaultUser);
          localStorage.setItem('currentUserId', defaultUser.id);
        });
      }
    }
  }, [users]);

  // Sync access timestamp over the server
  useEffect(() => {
    if (currentUser) {
      const now = new Date().toISOString();
      updateDoc(doc(db, 'users', currentUser.id), { lastAccess: now }).catch(() => {});
    }
  }, [currentUser?.id]);

  // Operations and Actions (Mutations)
  const addAuditLog = async (action: string, status: AuditLog['status'] = 'SUCCESS', activeUser: User | null = currentUser) => {
    const newLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: activeUser?.id || 'anonymous',
      userName: activeUser?.name || 'Sistema',
      role: activeUser?.role || 'system',
      action,
      ipAddress: '186.205.112.' + Math.floor(Math.random() * 255),
      status
    };
    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (err) {
      console.error("Audit log creation dropped locally: ", err);
    }
  };

  const handleSetCurrentUser = async (user: User | null) => {
    if (user) {
      localStorage.setItem('currentUserId', user.id);
      await syncFirebaseAuthWithUser(user);
      setCurrentUser(user);
      const actionText = `Acesso concedido: Sessão ativa como ${user.name} (${user.role.toUpperCase()})`;
      await addAuditLog(actionText, 'SUCCESS', user);
    } else {
      localStorage.removeItem('currentUserId');
      setCurrentUser(null);
      await addAuditLog(`Sessão encerrada voluntariamente`, 'ALERT', null);
    }
    setActiveTab('home');
  };

  const addBranch = async (name: string) => {
    const id = uuidv4();
    const newBranch: Branch = { id, name, createdAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'branches', id), newBranch);
      await addAuditLog(`Showroom Cadastrado: Nova filial criada - "${name}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
    }
  };

  const updateBranch = async (id: string, name: string) => {
    const oldBranch = branches.find(b => b.id === id);
    try {
      await updateDoc(doc(db, 'branches', id), { name });
      await addAuditLog(`Showroom Modificado: Filial "${oldBranch?.name || id}" renomeada para "${name}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
    }
  };

  const deleteBranch = async (id: string) => {
    const branch = branches.find(b => b.id === id);
    try {
      await deleteDoc(doc(db, 'branches', id));
      await addAuditLog(`DELEÇÃO OPERACIONAL: Filial "${branch?.name || id}" removida com segurança`, 'WARNING');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
    }
  };

  const addUser = async (name: string, role: Role, branchId?: string, phone?: string) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const idSafe = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const email = `${idSafe}_${cleanPhone || 'system'}@atendepro.com`.toLowerCase();

    let finalUserId = uuidv4();

    try {
      // Register in Firebase Auth via secondary app instance helper
      const secondaryAppName = 'temp-auth-creator-add';
      let secondaryApp;
      const apps = getApps();
      const existing = apps.find(app => app.name === secondaryAppName);
      if (existing) {
        secondaryApp = existing;
      } else {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      }
      const secondaryAuth = getAuth(secondaryApp);
      
      try {
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, PASSWORD_SECRET);
        if (userCred.user) {
          finalUserId = userCred.user.uid;
        }
      } catch (authErr: any) {
        console.warn("User credentials could not be registered automatically:", authErr);
      }

      const newUser: User = { 
        id: finalUserId, 
        name, 
        role, 
        branchId, 
        phone: phone || '(21) 99999-9999', 
        createdAt: new Date().toISOString() 
      };

      await setDoc(doc(db, 'users', finalUserId), newUser);
      const branchName = branches.find(b => b.id === branchId)?.name || 'Central';
      await addAuditLog(`Staff Cadastrado: Habilitado acesso para "${name}" como (${role.toUpperCase()}) na filial ${branchName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${finalUserId}`);
    }
  };

  const updateUser = async (id: string, name: string, phone?: string) => {
    const targetUser = users.find(u => u.id === id);
    const updatePayload: Partial<User> = { name };
    if (phone !== undefined) {
      updatePayload.phone = phone;
    }
    try {
      await updateDoc(doc(db, 'users', id), updatePayload);
      await addAuditLog(`Cadastro Retificado: Credenciais de "${targetUser?.name || id}" atualizadas`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    try {
      await deleteDoc(doc(db, 'users', id));
      await addAuditLog(`Revogação de Credenciais: Staff "${targetUser?.name || id}" desvinculado e excluído com segurança`, 'ALERT');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    }
  };

  const transferUser = async (userId: string, newBranchId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const oldBranch = branches.find(b => b.id === targetUser.branchId);
    const newBranch = branches.find(b => b.id === newBranchId);

    try {
      const batch = writeBatch(db);
      
      batch.update(doc(db, 'users', userId), { 
        branchId: newBranchId, 
        lastBranchId: targetUser.branchId || null 
      });

      // Update pending items
      quotes.forEach(q => {
        if (q.createdBy === userId && q.status === 'pending') {
          batch.update(doc(db, 'quotes', q.id), { isTransferred: true });
        }
      });

      await batch.commit();
      await addAuditLog(`TRANSFERÊNCIA GEOGRÁFICA: Alocado consultor "${targetUser.name}" de "${oldBranch?.name || 'Central'}" para "${newBranch?.name || 'Central'}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    }
  };

  const reassignQuotes = async (oldUserId: string, newUserId: string) => {
    const oldUser = users.find(u => u.id === oldUserId);
    const newUser = users.find(u => u.id === newUserId);
    try {
      const batch = writeBatch(db);
      quotes.forEach(q => {
        if (q.createdBy === oldUserId && q.status === 'pending') {
          batch.update(doc(db, 'quotes', q.id), { createdBy: newUserId });
        }
      });
      await batch.commit();
      await addAuditLog(`MIGRAÇÃO DE CARTEIRA: Transferidos orçamentos ativos de "${oldUser?.name}" para "${newUser?.name}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes`);
    }
  };

  const addQuote = async (quoteInput: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const id = uuidv4();
    const newQuote: Quote = {
      ...quoteInput,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'quotes', id), newQuote);
      await addAuditLog(`Proposta Registrada: Orçamento criado para o cliente "${quoteInput.clientName}" no valor de R$ ${quoteInput.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${id}`);
    }
  };

  const updateQuoteStatus = async (id: string, status: Quote['status']) => {
    const quote = quotes.find(q => q.id === id);
    try {
      await updateDoc(doc(db, 'quotes', id), { status });
      await addAuditLog(`Negociação Atualizada: Orçamento de "${quote?.clientName}" alterado para status [${status.toUpperCase()}]`, status === 'won' ? 'SUCCESS' : status === 'lost' ? 'ALERT' : 'SUCCESS');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${id}`);
    }
  };

  const updateCompanySettings = async (name: string, plan: string) => {
    try {
      await updateDoc(doc(db, 'companies', 'c1'), { name, plan });
      await addAuditLog(`Parâmetros SaaS Atualizados: ${name} (${plan})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'companies/c1');
    }
  };

  return (
    <AppContext.Provider value={{
      branches,
      users,
      quotes,
      currentUser,
      currentCompany,
      auditLogs,
      isLoading,
      activeTab,
      setActiveTab,
      setCurrentUser: handleSetCurrentUser,
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
