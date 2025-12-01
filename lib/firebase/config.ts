import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

declare global {
  // eslint-disable-next-line no-var
  var __FIREBASE_APP__: FirebaseApp | undefined;
  // eslint-disable-next-line no-var
  var __FIREBASE_DB__: Firestore | undefined;
  // eslint-disable-next-line no-var
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
