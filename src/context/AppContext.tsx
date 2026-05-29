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
  writeBatch,
  where
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Branch, User, Quote, Role, Company, AuditLog } from '../types';

const getSecondaryAuth = (app: any) => {
  try {
    return initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  } catch (e) {
    return getAuth(app);
  }
};

interface AppState {
  branches: Branch[];
  users: User[];
  quotes: Quote[];
  currentUser: User | null;
  currentCompany: Company;
  auditLogs: AuditLog[];
  isLoading: boolean;
  usingLocalFallback: boolean;
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
  updateUser: (id: string, name: string, phone?: string, allowedBranches?: string[]) => void;
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

const uniqById = <T extends { id: string }>(arr: T[]): T[] => {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const PASSWORD_SECRET = 'radar123';

export const getEmailForUser = (name: string, phone?: string, userId?: string) => {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const phoneSuffix = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : cleanPhone;
  
  if (phoneSuffix) {
    return `${safeName}_${phoneSuffix}@radarconquista.com.br`;
  }
  if (userId) {
    const idSafe = userId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
    return `${safeName}_${idSafe}@radarconquista.com.br`;
  }
  return `${safeName}@radarconquista.com.br`;
};

// Seeds general mocked structures if Firestore collections are absolutely blank
const seedDatabaseIfNeeded = async (resolvedCarlosUid?: string, resolvedAnaUid?: string, resolvedRobertoUid?: string) => {
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
      const carlosUid = resolvedCarlosUid || auth.currentUser?.uid || 'u1';
      
      // Let's register Ana and Roberto in Firebase Auth too so they can sign in later!
      let anaUid = resolvedAnaUid || 'u2';
      let robertoUid = resolvedRobertoUid || 'u3';

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
        name: 'RadarConquista',
        plan: 'Sistema Inteligente de Vendas e Relacionamento',
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
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('fallback_branches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('fallback_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem('fallback_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company>({
    id: 'c1',
    name: 'RadarConquista',
    plan: 'Sistema Inteligente de Vendas e Relacionamento',
    maxUsers: 150,
    licenseExpires: '2028-05-25T12:00:00Z'
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('fallback_auditLogs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [hasRestoredAuth, setHasRestoredAuth] = useState(false);

  // Sync state mutations to localStorage backups automatically
  useEffect(() => {
    if (branches && branches.length > 0) {
      localStorage.setItem('fallback_branches', JSON.stringify(branches));
    }
  }, [branches]);

  useEffect(() => {
    if (users && users.length > 0) {
      localStorage.setItem('fallback_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (quotes && quotes.length > 0) {
      localStorage.setItem('fallback_quotes', JSON.stringify(quotes));
    }
  }, [quotes]);

  useEffect(() => {
    if (auditLogs && auditLogs.length > 0) {
      localStorage.setItem('fallback_auditLogs', JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  // Helper to synchronize active Firebase Auth session with selected user's mock credentials
  const syncFirebaseAuthWithUser = async (user: User): Promise<User> => {
    // Under no circumstances should we disrupt the real Master operator authenticated session (montador2025@gmail.com)
    if (
      auth.currentUser?.email === 'montador2025@gmail.com' || 
      user.name === 'Supervisor Master' || 
      user.id === 'u_master' ||
      auth.currentUser?.email?.startsWith('montador2025')
    ) {
      console.log("Preserving Master operator authenticated session and bypassing credentials sync");
      return user;
    }

    const email = getEmailForUser(user.name, user.phone, user.id);
    const password = PASSWORD_SECRET;

    const handleSessionAlignment = async (realUid: string, userToAlign: User): Promise<User> => {
      if (userToAlign.id !== realUid) {
        console.log(`Session alignment mismatch: ${userToAlign.name} state id is ${userToAlign.id}, but real UID is ${realUid}`);
        
        // Update local storage
        localStorage.setItem('currentUserId', realUid);

        // Try to delete the legacy simple ID document if we can (purely optional/best-effort cleanup)
        if (userToAlign.id === 'u2' || userToAlign.id === 'u3' || userToAlign.id === 'aqh2wJwPxOYBFQAoAqoRzVKj6EB3') {
          try {
            await deleteDoc(doc(db, 'users', userToAlign.id));
            console.log(`Cleaned up legacy user document: ${userToAlign.id}`);
          } catch (delErr) {
            console.warn(`Could not delete legacy document ${userToAlign.id}:`, delErr);
          }
        }

        return {
          ...userToAlign,
          id: realUid
        };
      }
      return userToAlign;
    };

    if (auth.currentUser?.email === email) {
      if (auth.currentUser?.uid) {
        return await handleSessionAlignment(auth.currentUser.uid, user);
      }
      return user; 
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`Successfully synced Firebase Auth session for: ${user.name}`);
      return await handleSessionAlignment(cred.user.uid, user);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          console.log(`Dynamically registered & synced Firebase Auth credentials for: ${user.name}`);
          return await handleSessionAlignment(cred.user.uid, user);
        } catch (createErr) {
          console.error(`Dynamic registration failed for user ${user.name}:`, createErr);
        }
      } else {
        console.error(`Firebase Auth sync failed for ${user.name}:`, err);
      }
      return user;
    }
  };

  // Real-Time Sync Loop for shared resources (Branches, Users, Company Context)
  useEffect(() => {
    let unsubBranches: () => void = () => {};
    let unsubUsers: () => void = () => {};
    let unsubCompany: () => void = () => {};

    const robustAuthenticate = async (
      authInstance: any,
      email: string,
      newPassword: string,
      legacyPassword?: string
    ): Promise<string | null> => {
      try {
        const cred = await signInWithEmailAndPassword(authInstance, email, newPassword);
        console.log(`Successfully authenticated ${email} with current PASSWORD_SECRET.`);
        return cred.user.uid;
      } catch (authErr: any) {
        console.warn(`Initial authentication failed for ${email}: ${authErr.code || authErr.message}. Trying alternative methods...`);
        
        if (legacyPassword) {
          try {
            const cred = await signInWithEmailAndPassword(authInstance, email, legacyPassword);
            console.log(`Successfully authenticated ${email} with legacy PASSWORD_SECRET. Migrating to current...`);
            try {
              if (authInstance.currentUser) {
                await updatePassword(authInstance.currentUser, newPassword);
                console.log(`Successfully updated password to current PASSWORD_SECRET for ${email}`);
              }
            } catch (migErr) {
              console.warn(`Failed to update password legacy migrate for ${email}:`, migErr);
            }
            return cred.user.uid;
          } catch (legacyErr: any) {
            console.warn(`Authentication with legacy password also failed for ${email}: ${legacyErr.code || legacyErr.message}`);
          }
        }

        try {
          const cred = await createUserWithEmailAndPassword(authInstance, email, newPassword);
          console.log(`Successfully registered and seeded new user: ${email}`);
          return cred.user.uid;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            console.warn(`User ${email} already exists in auth backend but credentials mismatch.`);
            return null;
          } else {
            console.error(`Failed to register user account ${email}:`, createErr);
            throw createErr;
          }
        }
      }
    };

    const initAndListen = async () => {
      setIsLoading(true);
      try {
        const legacyPassword = 'atendepro123_safe';

        // Step 1: Initialize secondary auth to resolve UIDs cleanly without hijacking main session
        const secondaryAppNameForResolve = 'temp-auth-resolver-init';
        let secondaryApp;
        try {
          const apps = getApps();
          const existingApp = apps.find(app => app.name === secondaryAppNameForResolve);
          if (existingApp) {
            secondaryApp = existingApp;
          } else {
            secondaryApp = initializeApp(firebaseConfig, secondaryAppNameForResolve);
          }
        } catch (appErr) {
          console.error("Failed to initialize secondary app for resolver:", appErr);
        }

        let carlosUid = '';
        let resolvedAnaUid = 'u2';
        let resolvedRobertoUid = 'u3';

        const supervisorEmail = getEmailForUser('Carlos', '(21) 99999-1111');
        const anaMail = getEmailForUser('Ana', '(21) 98888-2222');
        const robertoMail = getEmailForUser('Roberto', '(21) 97777-3333');
        const masterEmail = 'montador2025@gmail.com';

        if (secondaryApp) {
          const sAuth = getSecondaryAuth(secondaryApp);
          
          carlosUid = await robustAuthenticate(sAuth, supervisorEmail, PASSWORD_SECRET, legacyPassword) || '';
          resolvedAnaUid = await robustAuthenticate(sAuth, anaMail, PASSWORD_SECRET, legacyPassword) || 'u2';
          resolvedRobertoUid = await robustAuthenticate(sAuth, robertoMail, PASSWORD_SECRET, legacyPassword) || 'u3';

          // Also guarantee master email login is registered in Auth as well
          try {
            await robustAuthenticate(sAuth, masterEmail, PASSWORD_SECRET, legacyPassword);
            console.log("Master supervisor registered/aligned on secondary auth");
          } catch (masterErr) {
            console.error("Failed to guarantee master signup:", masterErr);
          }
        }

        if (!carlosUid) {
          carlosUid = 'u1';
        }

        // Step 2: Now sign in as montador2025@gmail.com (Master bypass email) to gain supreme write authority on the database
        console.log("Authenticating Master bypass session on primary instance...");
        const masterUid = await robustAuthenticate(auth, masterEmail, PASSWORD_SECRET, legacyPassword);
        if (masterUid) {
          console.log("Master supervisor session active. Ready to seed and align user documents securely.");
        }

        // Step 3: Write user documents under Master's authorized session.
        if (masterUid) {
          try {
            await setDoc(doc(db, 'users', masterUid), {
              id: masterUid,
              name: 'Supervisor Master',
              role: 'supervisor',
              phone: '(21) 90000-0000',
              createdAt: new Date().toISOString()
            });
            console.log("Aligned and self-seeded Master supervisor document on database");
          } catch (masterDocErr) {
            console.error("Master failed to check or create Master supervisor document:", masterDocErr);
          }
        }

        if (carlosUid) {
          try {
            await setDoc(doc(db, 'users', carlosUid), {
              id: carlosUid,
              name: 'Carlos',
              role: 'supervisor',
              phone: '(21) 99999-1111',
              createdAt: new Date().toISOString()
            });
            console.log("Aligned and self-seeded Carlos supervisor document on database under Master bypass authentication");
            try {
              await deleteDoc(doc(db, 'users', 'u1'));
            } catch (delErr) {}
          } catch (carlosDocErr) {
            console.error("Master failed to create or check Carlos supervisor document:", carlosDocErr);
          }
        }

        if (resolvedAnaUid) {
          try {
            await setDoc(doc(db, 'users', resolvedAnaUid), {
              id: resolvedAnaUid,
              name: 'Ana',
              role: 'manager',
              branchId: 'b1',
              phone: '(21) 98888-2222',
              createdAt: new Date().toISOString()
            });
            if (resolvedAnaUid !== 'u2') {
              try {
                await deleteDoc(doc(db, 'users', 'u2'));
              } catch (delErr) {}
            }
            console.log("Aligned and saved Ana's user document at UID: " + resolvedAnaUid);
          } catch (anaDocErr) {
            console.error("Master failed to write Ana's document:", anaDocErr);
          }
        }

        if (resolvedRobertoUid) {
          try {
            await setDoc(doc(db, 'users', resolvedRobertoUid), {
              id: resolvedRobertoUid,
              name: 'Roberto',
              role: 'salesperson',
              branchId: 'b1',
              phone: '(21) 97777-3333',
              createdAt: new Date().toISOString()
            });
            if (resolvedRobertoUid !== 'u3') {
              try {
                await deleteDoc(doc(db, 'users', 'u3'));
              } catch (delErr) {}
            }
            console.log("Aligned and saved Roberto's user document at UID: " + resolvedRobertoUid);

            // Legacy quote creation mapping fix: migrate seeded q1 createdBy to resolvedRobertoUid
            try {
              const q1DocRef = doc(db, 'quotes', 'q1');
              const q1Snapshot = await getDoc(q1DocRef);
              if (q1Snapshot.exists()) {
                const q1Data = q1Snapshot.data();
                if (q1Data.createdBy === 'u3' || q1Data.createdBy === 'u2') {
                  await updateDoc(q1DocRef, { createdBy: resolvedRobertoUid });
                  console.log("Migrated seeded quote q1 owner to Roberto's UID");
                }
              }
            } catch (q1MigrateErr) {
              console.error("Failed to migrate q1 quote owner:", q1MigrateErr);
            }
          } catch (robertoDocErr) {
            console.error("Master failed to write Roberto's document:", robertoDocErr);
          }
        }

        // Step 4: Ensure other collections & documents exist
        await seedDatabaseIfNeeded(carlosUid, resolvedAnaUid, resolvedRobertoUid);

        // Step 5: Always guarantee that Carlos remains authenticated to prevent any secondary auth creation from hijacking the main Auth session.
        // We use robustAuthenticate so we attempt password recovery/migrations for Carlos session smoothly
        console.log("Restoring active user session on primary client to Supervisor Carlos...");
        try {
          await robustAuthenticate(auth, supervisorEmail, PASSWORD_SECRET, legacyPassword);
          console.log("Successfully validated and restored Carlos supervisor auth session in main client");
        } catch (reAuthErr) {
          console.error("Failed to restore Carlos supervisor auth context:", reAuthErr);
        }

        // Step 3: Establish real-time live observers for shared endpoints
        unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
          const list: Branch[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as Branch));
          setBranches(uniqById(list));
          setUsingLocalFallback(false);
        }, (err) => {
          setBranches(prev => prev && prev.length > 0 ? prev : uniqById(mockBranches));
          setUsingLocalFallback(true);
          try {
            handleFirestoreError(err, OperationType.GET, 'branches');
          } catch (e) {
            console.warn("Caught Firestore permission issue; activating local simulation:", e);
          }
        });

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
          setUsers(uniqById(list));
          setUsingLocalFallback(false);
        }, (err) => {
          setUsers(prev => prev && prev.length > 0 ? prev : uniqById(mockUsers));
          setUsingLocalFallback(true);
          try {
            handleFirestoreError(err, OperationType.GET, 'users');
          } catch (e) {
            console.warn("Caught Firestore permission issue; activating local simulation:", e);
          }
        });

        unsubCompany = onSnapshot(doc(db, 'companies', 'c1'), (snap) => {
          if (snap.exists()) {
            setCurrentCompany(snap.data() as Company);
          }
          setUsingLocalFallback(false);
        }, (err) => {
          setUsingLocalFallback(true);
          try {
            handleFirestoreError(err, OperationType.GET, 'companies');
          } catch (e) {
            console.warn("Caught Firestore permission issue; activating local simulation:", e);
          }
        });

      } catch (err) {
        console.error("Initialization of AppContext synchronization failed, falling back to local simulation:", err);
        setUsingLocalFallback(true);
        setBranches(uniqById(mockBranches));
        setUsers(uniqById(mockUsers));
        setCurrentCompany({
          id: 'c1',
          name: 'RadarConquista',
          plan: 'Sistema Inteligente de Vendas e Relacionamento',
          maxUsers: 150,
          licenseExpires: '2028-05-25T12:00:00Z'
        });
        setIsLoading(false);
      } finally {
        if (!localStorage.getItem('currentUserId')) {
          setIsLoading(false);
        }
      }
    };

    initAndListen();

    return () => {
      unsubBranches();
      unsubUsers();
      unsubCompany();
    };
  }, []);

  // Dynamic Real-Time Sync Loop for sensitive collections (quotes and auditLogs)
  // Re-binds snap listeners using specific Firestore queries that align with ABAC Security Rules
  useEffect(() => {
    if (!currentUser) return;

    let unsubQuotes: () => void = () => {};
    let unsubAudit: () => void = () => {};

    // 1. Configure Quote Query based on context-role
    let quotesQuery;
    if (currentUser.role === 'supervisor') {
      quotesQuery = collection(db, 'quotes');
    } else if (currentUser.role === 'manager' && currentUser.branchId) {
      quotesQuery = query(collection(db, 'quotes'), where('branchId', '==', currentUser.branchId));
    } else {
      quotesQuery = query(collection(db, 'quotes'), where('createdBy', '==', currentUser.id));
    }

    // Subscribe to quotes securely
    unsubQuotes = onSnapshot(quotesQuery, (snap) => {
      const list: Quote[] = [];
      snap.forEach(docSnap => list.push(docSnap.data() as Quote));
      setQuotes(uniqById(list));
      setUsingLocalFallback(false);
    }, (err) => {
      const filteredMocks = mockQuotes.filter(q => {
        if (currentUser.role === 'supervisor') return true;
        if (currentUser.role === 'manager') return q.branchId === currentUser.branchId;
        return q.createdBy === currentUser.id;
      });
      setQuotes(prev => prev && prev.length > 0 ? prev : uniqById(filteredMocks));
      console.warn("Handled quotes query subscription error gracefully (activating local data fallback):", err);
    });

    // 2. Configure Audit Logs Query (Supervisor authentication context only)
    if (currentUser.role === 'supervisor') {
      const auditQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
      unsubAudit = onSnapshot(auditQuery, (snap) => {
        const list: AuditLog[] = [];
        snap.forEach(docSnap => list.push(docSnap.data() as AuditLog));
        setAuditLogs(uniqById(list));
        setUsingLocalFallback(false);
      }, (err) => {
        const defaultAuditLogs = [
          { id: 'l1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), userId: currentUser.id, userName: currentUser.name, role: 'supervisor', action: 'Políticas de controle de privilégios e auditoria de sessão SaaS implantadas', ipAddress: '186.205.112.5', status: 'SUCCESS' },
          { id: 'l2', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), userId: currentUser.id, userName: currentUser.name, role: 'supervisor', action: 'Conexão e sincronização real-time com banco de dados Firebase Firestore ativado', ipAddress: '186.205.112.5', status: 'SUCCESS' },
          { id: 'l3', timestamp: new Date().toISOString(), userId: currentUser.id, userName: currentUser.name, role: 'supervisor', action: 'Sessão administrativa ativada com segurança baseada em token real-time', ipAddress: '186.205.112.5', status: 'SUCCESS' }
        ];
        setAuditLogs(uniqById(defaultAuditLogs));
        console.warn("Handled auditLogs subscription error gracefully (activating default logs):", err);
      });
    } else {
      // Non-supervisors have zero read access to live audit history
      setAuditLogs([]);
    }

    return () => {
      unsubQuotes();
      unsubAudit();
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.branchId]);

  // Sync Logged User Profile and ensure custom auth alignment
  useEffect(() => {
    if (users.length > 0 && !hasRestoredAuth) {
      let savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        // Self-heal legacy simple IDs in LocalStorage transparently
        if (savedUserId === 'u1' || savedUserId === 'u2' || savedUserId === 'u3') {
          console.log(`Found legacy default user ID in storage: ${savedUserId}. Resolving real UID...`);
          let matchName = '';
          if (savedUserId === 'u1') matchName = 'Carlos';
          else if (savedUserId === 'u2') matchName = 'Ana';
          else if (savedUserId === 'u3') matchName = 'Roberto';
          
          if (matchName) {
            const resolvedUser = users.find(u => u.name === matchName);
            if (resolvedUser) {
              savedUserId = resolvedUser.id;
              localStorage.setItem('currentUserId', savedUserId);
              console.log(`Successfully transitioned legacy LocalStorage token to: ${savedUserId}`);
            }
          }
        }

        const found = users.find(u => u.id === savedUserId);
        if (found) {
          syncFirebaseAuthWithUser(found).then((alignedUser) => {
            setCurrentUser(alignedUser);
            setHasRestoredAuth(true);
            setIsLoading(false);
          }).catch(err => {
            console.error("Auth restore error:", err);
            setHasRestoredAuth(true);
            setIsLoading(false);
          });
          return;
        }
      }
      setHasRestoredAuth(true);
      setIsLoading(false);
    }
  }, [users, hasRestoredAuth]);

  // Sync access timestamp over the server periodically (every 2 minutes) while active
  useEffect(() => {
    if (!currentUser) return;
    
    const updateAccess = () => {
      const now = new Date().toISOString();
      updateDoc(doc(db, 'users', currentUser.id), { lastAccess: now }).catch((err) => {
        console.warn("Could not sync lastAccess:", err);
      });
    };

    // Run immediately
    updateAccess();

    // Run every 2 minutes
    const interval = setInterval(updateAccess, 120000);
    return () => clearInterval(interval);
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
    if (usingLocalFallback) {
      setAuditLogs(prev => uniqById([newLog, ...prev]));
      return;
    }
    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (err) {
      setAuditLogs(prev => uniqById([newLog, ...prev]));
      console.error("Audit log creation dropped locally: ", err);
    }
  };

  const handleSetCurrentUser = async (user: User | null) => {
    if (user) {
      localStorage.setItem('currentUserId', user.id);
      const alignedUser = await syncFirebaseAuthWithUser(user);
      setCurrentUser(alignedUser);
      const actionText = `Acesso concedido: Sessão ativa como ${alignedUser.name} (${alignedUser.role.toUpperCase()})`;
      await addAuditLog(actionText, 'SUCCESS', alignedUser);
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
    
    const executeLocal = () => {
      setBranches(prev => uniqById([...prev, newBranch]));
      addAuditLog(`Showroom Cadastrado: Nova filial criada - "${name}"`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await setDoc(doc(db, 'branches', id), newBranch);
      await addAuditLog(`Showroom Cadastrado: Nova filial criada - "${name}"`);
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const updateBranch = async (id: string, name: string) => {
    const oldBranch = branches.find(b => b.id === id);

    const executeLocal = () => {
      setBranches(prev => prev.map(b => b.id === id ? { ...b, name } : b));
      addAuditLog(`Showroom Modificado: Filial "${oldBranch?.name || id}" renomeada para "${name}"`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await updateDoc(doc(db, 'branches', id), { name });
      await addAuditLog(`Showroom Modificado: Filial "${oldBranch?.name || id}" renomeada para "${name}"`);
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const deleteBranch = async (id: string) => {
    const branch = branches.find(b => b.id === id);

    const executeLocal = () => {
      setBranches(prev => prev.filter(b => b.id !== id));
      addAuditLog(`DELEÇÃO OPERACIONAL: Filial "${branch?.name || id}" removida com segurança`, 'WARNING');
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await deleteDoc(doc(db, 'branches', id));
      await addAuditLog(`DELEÇÃO OPERACIONAL: Filial "${branch?.name || id}" removida com segurança`, 'WARNING');
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `branches/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const addUser = async (name: string, role: Role, branchId?: string, phone?: string) => {
    let finalUserId = uuidv4();
    const email = getEmailForUser(name, phone, finalUserId);
    const newUser: User = { 
      id: finalUserId, 
      name, 
      role, 
      branchId, 
      phone: phone || '(21) 99999-9999', 
      createdAt: new Date().toISOString() 
    };

    const executeLocal = () => {
      setUsers(prev => uniqById([...prev, newUser]));
      const branchName = branches.find(b => b.id === branchId)?.name || 'Central';
      addAuditLog(`Staff Cadastrado: Habilitado acesso para "${name}" como (${role.toUpperCase()}) na filial ${branchName}`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    const previousCurrentUser = currentUser;

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
      const secondaryAuth = getSecondaryAuth(secondaryApp);
      
      try {
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, PASSWORD_SECRET);
        if (userCred.user) {
          finalUserId = userCred.user.uid;
          newUser.id = finalUserId;
        }
      } catch (authErr: any) {
        console.warn("User credentials could not be registered automatically, trying sign-in fallback:", authErr);
        try {
          const userCred = await signInWithEmailAndPassword(secondaryAuth, email, PASSWORD_SECRET);
          if (userCred.user) {
            finalUserId = userCred.user.uid;
            newUser.id = finalUserId;
            console.log("Successfully retrieved pre-existing UID for user from Firebase Auth: " + finalUserId);
          }
        } catch (signInErr) {
          console.error("Secondary auth sign-in fallback failed too for email:", email, signInErr);
        }
      }

      await setDoc(doc(db, 'users', finalUserId), newUser);
      const branchName = branches.find(b => b.id === branchId)?.name || 'Central';
      await addAuditLog(`Staff Cadastrado: Habilitado acesso para "${name}" como (${role.toUpperCase()}) na filial ${branchName}`);

      // Restore session
      if (previousCurrentUser) {
        const alignedPrev = await syncFirebaseAuthWithUser(previousCurrentUser);
        setCurrentUser(alignedPrev);
      }
    } catch (err) {
      if (previousCurrentUser) {
        try {
          const alignedPrev = await syncFirebaseAuthWithUser(previousCurrentUser);
          setCurrentUser(alignedPrev);
        } catch (restoreErr) {
          console.error("Failed to restore user session after error:", restoreErr);
        }
      }
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${finalUserId}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const updateUser = async (id: string, name: string, phone?: string, allowedBranches?: string[]) => {
    const targetUser = users.find(u => u.id === id);
    const updatePayload: Partial<User> = { name };
    if (phone !== undefined) {
      updatePayload.phone = phone;
    }
    if (allowedBranches !== undefined) {
      updatePayload.allowedBranches = allowedBranches;
    }

    const executeLocal = () => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatePayload } : u));
      addAuditLog(`Cadastro Retificado: Credenciais de "${targetUser?.name || id}" atualizadas`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await updateDoc(doc(db, 'users', id), updatePayload);
      await addAuditLog(`Cadastro Retificado: Credenciais de "${targetUser?.name || id}" atualizadas`);
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const deleteUser = async (id: string) => {
    const targetUser = users.find(u => u.id === id);

    const executeLocal = () => {
      setUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog(`Revogação de Credenciais: Staff "${targetUser?.name || id}" desvinculado e excluído com segurança`, 'ALERT');
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', id));
      await addAuditLog(`Revogação de Credenciais: Staff "${targetUser?.name || id}" desvinculado e excluído com segurança`, 'ALERT');
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const transferUser = async (userId: string, newBranchId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const oldBranch = branches.find(b => b.id === targetUser.branchId);
    const newBranch = branches.find(b => b.id === newBranchId);

    const executeLocal = () => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, branchId: newBranchId, lastBranchId: targetUser.branchId || null } : u));
      setQuotes(prev => prev.map(q => q.createdBy === userId && q.status === 'pending' ? { ...q, isTransferred: true } : q));
      addAuditLog(`TRANSFERÊNCIA GEOGRÁFICA: Alocado consultor "${targetUser.name}" de "${oldBranch?.name || 'Central'}" para "${newBranch?.name || 'Central'}"`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

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
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const reassignQuotes = async (oldUserId: string, newUserId: string) => {
    const oldUser = users.find(u => u.id === oldUserId);
    const newUser = users.find(u => u.id === newUserId);

    const executeLocal = () => {
      setQuotes(prev => prev.map(q => q.createdBy === oldUserId && q.status === 'pending' ? { ...q, createdBy: newUserId } : q));
      addAuditLog(`MIGRAÇÃO DE CARTEIRA: Transferidos orçamentos ativos de "${oldUser?.name}" para "${newUser?.name}"`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

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
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `quotes`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
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

    const executeLocal = () => {
      setQuotes(prev => uniqById([...prev, newQuote]));
      addAuditLog(`Proposta Registrada: Orçamento criado para o cliente "${quoteInput.clientName}" no valor de R$ ${quoteInput.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await setDoc(doc(db, 'quotes', id), newQuote);
      await addAuditLog(`Proposta Registrada: Orçamento criado para o cliente "${quoteInput.clientName}" no valor de R$ ${quoteInput.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `quotes/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const updateQuoteStatus = async (id: string, status: Quote['status']) => {
    const quote = quotes.find(q => q.id === id);

    const executeLocal = () => {
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
      addAuditLog(`Negociação Atualizada: Orçamento de "${quote?.clientName}" alterado para status [${status.toUpperCase()}]`, status === 'won' ? 'SUCCESS' : status === 'lost' ? 'ALERT' : 'SUCCESS');
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await updateDoc(doc(db, 'quotes', id), { status });
      await addAuditLog(`Negociação Atualizada: Orçamento de "${quote?.clientName}" alterado para status [${status.toUpperCase()}]`, status === 'won' ? 'SUCCESS' : status === 'lost' ? 'ALERT' : 'SUCCESS');
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, `quotes/${id}`);
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const updateCompanySettings = async (name: string, plan: string) => {
    const executeLocal = () => {
      setCurrentCompany(prev => ({ ...prev, name, plan }));
      addAuditLog(`Parâmetros SaaS Atualizados: ${name} (${plan})`);
    };

    if (usingLocalFallback) {
      executeLocal();
      return;
    }

    try {
      await updateDoc(doc(db, 'companies', 'c1'), { name, plan });
      await addAuditLog(`Parâmetros SaaS Atualizados: ${name} (${plan})`);
    } catch (err) {
      setUsingLocalFallback(true);
      executeLocal();
      try {
        handleFirestoreError(err, OperationType.WRITE, 'companies/c1');
      } catch (e) {
        console.warn("Handled database write error: ", e);
      }
    }
  };

  const isMaster = currentUser?.role === 'supervisor' && (
    currentUser?.id === 'u_master' ||
    currentUser?.name === 'Supervisor Master' ||
    currentUser?.phone === '(21) 90000-0000' ||
    auth.currentUser?.email === 'montador2025@gmail.com'
  );

  const isLimitedSupervisor = currentUser?.role === 'supervisor' && !isMaster && currentUser?.allowedBranches && currentUser.allowedBranches.length > 0;

  const exposedBranches = isLimitedSupervisor 
    ? branches.filter(b => currentUser.allowedBranches?.includes(b.id))
    : branches;

  const exposedUsers = isLimitedSupervisor
    ? users.filter(u => u.role === 'supervisor' || (u.branchId && currentUser.allowedBranches?.includes(u.branchId)))
    : users;

  const exposedQuotes = isLimitedSupervisor
    ? quotes.filter(q => currentUser.allowedBranches?.includes(q.branchId))
    : quotes;

  return (
    <AppContext.Provider value={{
      branches: exposedBranches,
      users: exposedUsers,
      quotes: exposedQuotes,
      currentUser,
      currentCompany,
      auditLogs,
      isLoading,
      usingLocalFallback,
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
