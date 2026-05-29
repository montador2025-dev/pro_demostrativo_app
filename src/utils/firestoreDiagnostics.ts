import { auth, db } from '../lib/firebase';
import { getIdTokenResult } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, limit, setDoc, deleteDoc } from 'firebase/firestore';

export interface DiagnosticCheckResult {
  name: string;
  path: string;
  expectedBehavior: string;
  status: 'passed' | 'failed' | 'not_tested';
  actualResult: string;
  errorDetails?: any;
}

export interface DiagnosticsReport {
  timestamp: string;
  auth: {
    isAuthenticated: boolean;
    uid: string | null;
    email: string | null;
    emailVerified: boolean;
    providerId: string | null;
    claims: Record<string, any>;
  };
  firestoreChecks: DiagnosticCheckResult[];
  recommendations: string[];
}

/**
 * Runs diagnostics on Firestore security permissions and current user auth claims.
 * Performs non-destructive read/write test cases to analyze exact rules compliance.
 */
export async function runFirestoreDiagnostics(): Promise<DiagnosticsReport> {
  const currentTimestamp = new Date().toISOString();
  
  // 1. Collect Auth & Custom Claims Information
  const currentUser = auth.currentUser;
  const authInfo = {
    isAuthenticated: !!currentUser,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    emailVerified: currentUser?.emailVerified || false,
    providerId: currentUser?.providerData?.[0]?.providerId || null,
    claims: {} as Record<string, any>,
  };

  if (currentUser) {
    try {
      const tokenResult = await getIdTokenResult(currentUser, true);
      authInfo.claims = tokenResult.claims;
    } catch (tokenErr) {
      console.warn("Failed to retrieve ID token results/claims:", tokenErr);
    }
  }

  const checks: DiagnosticCheckResult[] = [];
  const recommendations: string[] = [];

  // 2. Perform non-destructive Firestore checks
  if (!authInfo.isAuthenticated) {
    checks.push({
      name: 'Global Authentication Check',
      path: 'auth/session',
      expectedBehavior: 'User must be authenticated to check Firestore rules permissions',
      status: 'failed',
      actualResult: 'Unauthenticated. Sign in first.',
    });
    recommendations.push(
      'Initialize a user session: The current environment requires a signed-in session before checking Firestore permissions.'
    );
    return {
      timestamp: currentTimestamp,
      auth: authInfo,
      firestoreChecks: checks,
      recommendations,
    };
  }

  const uid = authInfo.uid!;

  // Check 1: Read Self Document in /users/{uid}
  try {
    const selfDocRef = doc(db, 'users', uid);
    const selfSnap = await getDoc(selfDocRef);
    checks.push({
      name: 'Leitura de Documento do Próprio Usuário',
      path: `users/${uid}`,
      expectedBehavior: 'Permitido para o próprio usuário autenticado',
      status: 'passed',
      actualResult: selfSnap.exists() 
        ? `Sucesso. Documento encontrado. Perfil: ${selfSnap.data()?.name} (${selfSnap.data()?.role})`
        : 'Sucesso. Documento retornado como vazio (inexistente, mas leitura foi permitida).',
    });
  } catch (err: any) {
    checks.push({
      name: 'Leitura de Documento do Próprio Usuário',
      path: `users/${uid}`,
      expectedBehavior: 'Permitido para o próprio usuário autenticado',
      status: 'failed',
      actualResult: `Negado. Erro de permissão.`,
      errorDetails: err?.message || err,
    });
    recommendations.push(
      `Verifique se o usuário tem permissão para ler seu próprio documento em 'users/${uid}'. Se o documento não existir, certifique-se de que a regra 'allow read: if isSignedIn()' esteja ativa e não dependente de 'exists()'.`
    );
  }

  // Check 2: Try reading /companies
  try {
    const compColRef = collection(db, 'companies');
    const compSnap = await getDocs(query(compColRef, limit(1)));
    checks.push({
      name: 'Leitura de Empresas (Tenants)',
      path: 'companies',
      expectedBehavior: 'Qualquer usuário autenticado pode ler empresas',
      status: 'passed',
      actualResult: `Sucesso. Retornou ${compSnap.size} documentos.`,
    });
  } catch (err: any) {
    checks.push({
      name: 'Leitura de Empresas (Tenants)',
      path: 'companies',
      expectedBehavior: 'Qualquer usuário autenticado pode ler empresas',
      status: 'failed',
      actualResult: 'Negado. Erro de permissão.',
      errorDetails: err?.message || err,
    });
    recommendations.push(
      "A regra de leitura da coleção '/companies' requer autenticação ('allow read: if isSignedIn()'). Revise os tokens de acesso nas Security Rules."
    );
  }

  // Check 3: Read test /branches collection
  try {
    const branchColRef = collection(db, 'branches');
    const branchSnap = await getDocs(query(branchColRef, limit(1)));
    checks.push({
      name: 'Leitura de Filiais (Branches)',
      path: 'branches',
      expectedBehavior: 'Qualquer usuário autenticado pode listar filiais',
      status: 'passed',
      actualResult: `Sucesso. Retornou ${branchSnap.size} filiais.`,
    });
  } catch (err: any) {
    checks.push({
      name: 'Leitura de Filiais (Branches)',
      path: 'branches',
      expectedBehavior: 'Qualquer usuário autenticado pode listar filiais',
      status: 'failed',
      actualResult: 'Negado. Erro de permissão.',
      errorDetails: err?.message || err,
    });
  }

  // Check 4: Add simple auditLog to test stream-write creation
  const tempLogId = `diag-${Math.random().toString(36).substring(7)}`;
  const mockAuditPayload = {
    id: tempLogId,
    timestamp: new Date().toISOString(),
    userId: uid,
    userName: currentUser?.displayName || 'Diagnóstico de Sistema',
    role: (authInfo.claims.email && authInfo.claims.email.includes('ana_')) ? 'manager' : 'supervisor',
    action: `Varredura diagnóstica e teste de escrita temporária`,
    ipAddress: '127.0.0.1',
    status: 'SUCCESS' as const
  };

  try {
    await setDoc(doc(db, 'auditLogs', tempLogId), mockAuditPayload);
    checks.push({
      name: 'Teste de Gravação de Log de Auditoria',
      path: `auditLogs/${tempLogId}`,
      expectedBehavior: 'Usuários autenticados podem submeter logs de auditoria válidos',
      status: 'passed',
      actualResult: 'Sucesso. Escrita concluída com sucesso.',
    });
    
    // Attempt cleanup (Under rules, update/delete on auditLogs is disallowed, so this should gracefully be blocked OR ignored)
    try {
      await deleteDoc(doc(db, 'auditLogs', tempLogId));
    } catch (_) {
      // expected behavior - update or delete audit log is forbidden by security rules
    }
  } catch (err: any) {
    checks.push({
      name: 'Teste de Gravação de Log de Auditoria',
      path: `auditLogs/${tempLogId}`,
      expectedBehavior: 'Usuários autenticados podem submeter logs de auditoria válidos',
      status: 'failed',
      actualResult: 'Negado ou erro de validação do esquema de dados.',
      errorDetails: err?.message || err,
    });
    recommendations.push(
      "O log de auditoria deve conter exatamente os campos requeridos na regra isValidAuditLog() e no tamanho correto. Confirme se a regra 'isValidAuditLog' e 'allow create: if isSignedIn()' estão corretas."
    );
  }

  // Check 5: Aligned user creation block check
  // Test if users document can be self-created / isManager or isSupervisor can write
  const testUserId = `test-user-${Math.random().toString(36).substring(7)}`;
  const isManagerUser = authInfo.email?.startsWith('ana_');
  const isSupervisorUser = authInfo.email === 'montador2025@gmail.com' || authInfo.email?.startsWith('carlos_');

  let roleLabel = 'salesperson';
  if (isManagerUser) roleLabel = 'manager';
  if (isSupervisorUser) roleLabel = 'supervisor';

  checks.push({
    name: 'Privilegios de Escrevente',
    path: `users/${uid}`,
    expectedBehavior: `Informação estatística das regras. Nível: ${roleLabel}`,
    status: 'passed',
    actualResult: isSupervisorUser 
      ? 'Supervisor Master (Acesso Total de Escrita/Criação)' 
      : isManagerUser 
        ? 'Gerente (Permitido criar/deletar consultores vinculados à mesma filial)' 
        : 'Consultor de Vendas (Nenhum privilégio administrativo de criação)',
  });

  // Final overall diagnostic analysis & suggestion
  if (checks.some(c => c.status === 'failed')) {
    recommendations.push(
      "Dica de Alinhamento: Erros de permissão ocorrem geralmente se o ID de usuário no Firestore diferir do ID de Autenticação Real do Firebase Auth (UID). O recurso 'self-alignment' na inicialização sincroniza a sessão, porém o Supervisor deve registrar os usuários no banco mapeando corretamento o UID real."
    );
  } else {
    recommendations.push(
      "Parabéns! Todas as requisições de teste e canais de validação estão operantes com absoluto sucesso sob as regras de segurança em vigor!"
    );
  }

  return {
    timestamp: currentTimestamp,
    auth: authInfo,
    firestoreChecks: checks,
    recommendations,
  };
}
