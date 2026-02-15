import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

function readPublicEnv(key: string): string | undefined {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : value;
}

const firebaseConfig = {
  apiKey: readPublicEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readPublicEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readPublicEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readPublicEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readPublicEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readPublicEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

/**
 * Global declarations for Firebase singleton instances.
 * Using 'var' is intentional for globalThis augmentation in TypeScript.
 * This pattern prevents multiple Firebase instances in development (HMR)
 * and ensures consistent behavior across server/client boundaries.
 */
declare global {
  // Using 'var' is required for globalThis augmentation
  var __FIREBASE_APP__: FirebaseApp | undefined;
  var __FIREBASE_DB__: Firestore | undefined;
  var __FIREBASE_AUTH__: Auth | undefined;
}

function ensureFirebaseApp(): FirebaseApp {
  if (!globalThis.__FIREBASE_APP__) {
    const apps = getApps();
    globalThis.__FIREBASE_APP__ =
      apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  }
  return globalThis.__FIREBASE_APP__;
}

function ensureFirestore(): Firestore {
  if (!globalThis.__FIREBASE_DB__) {
    globalThis.__FIREBASE_DB__ = getFirestore(ensureFirebaseApp());
  }
  return globalThis.__FIREBASE_DB__;
}

function ensureAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is only available in the browser environment.");
  }

  if (!globalThis.__FIREBASE_AUTH__) {
    globalThis.__FIREBASE_AUTH__ = getAuth(ensureFirebaseApp());
  }

  return globalThis.__FIREBASE_AUTH__;
}

const app = ensureFirebaseApp();
const db = ensureFirestore();

export { app, db };
export { ensureAuth as getFirebaseAuth };
