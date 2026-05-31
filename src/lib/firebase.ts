import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '""' && firebaseConfig.firestoreDatabaseId !== '')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Connectivity Health Check (as required by SKILL.md guidelines)
export async function testConnection(silent: boolean = false): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    // If we receive a security model exception, it means we reached the server and queried the rules successfully!
    if (error && (
      error.code === 'permission-denied' ||
      error.code === 'unauthenticated' ||
      (error.message && (
        error.message.toLowerCase().includes('permission') ||
        error.message.toLowerCase().includes('unauthenticated') ||
        error.message.toLowerCase().includes('insufficient')
      ))
    )) {
      return true;
    }
    if (!silent) {
      if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('offline'))) {
        console.error("Please check your Firebase configuration.");
      }
    }
    return false;
  }
}

// Strictly conform to OperationType as defined in SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Strictly conform to FirestoreErrorInfo as defined in SKILL.md
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Strict Error Handler conforming to SKILL.md specification
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Execute connection validation check on load
testConnection(true).catch(() => {});
