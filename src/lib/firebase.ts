/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import configFile from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configFile.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || configFile.measurementId,
};

const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || configFile.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  UPDATE = 'update',
  CREATE = 'create',
  LIST = 'list'
}

export const handleFirestoreError = (error: any, operation: OperationType, ...args: any[]) => {
  if (error?.message?.includes('Quota exceeded') || error?.code === 'resource-exhausted') {
    console.warn(`Firestore ${operation} quota exceeded. Using fallback.`, error.message);
  } else {
    console.error(`Firestore ${operation} error:`, error, ...args);
  }
  throw error;
};

export default app;
