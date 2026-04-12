/**
 * Centralized Firebase mock factories for tests.
 *
 * Usage in test files:
 *   import { mockFirebaseAdmin, mockFirestoreClient } from "@/tests/mocks/firebase";
 *   vi.mock("@/lib/firebase/admin", () => mockFirebaseAdmin());
 *   vi.mock("@/lib/firebase/config", () => mockFirestoreClient());
 */

import { vi } from "vitest";

// ─── Admin SDK mocks (server-side) ───

export interface AdminAuthMocks {
  createUser: ReturnType<typeof vi.fn>;
  deleteUser: ReturnType<typeof vi.fn>;
  verifyIdToken: ReturnType<typeof vi.fn>;
  createCustomToken: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
}

export interface AdminDbMocks {
  collection: any;
  doc: any;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  batch: any;
  runTransaction: ReturnType<typeof vi.fn>;
  listDocuments: ReturnType<typeof vi.fn>;
}

export function createAdminAuthMocks(): AdminAuthMocks {
  return {
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    verifyIdToken: vi.fn(),
    createCustomToken: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
  };
}

export function createAdminDbMocks(): AdminDbMocks {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockListDocuments = vi.fn().mockResolvedValue([]);

  const mockDoc = vi.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    listDocuments: mockListDocuments,
    id: "mock-doc-id",
  }));

  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
    listDocuments: mockListDocuments,
  }));

  return {
    collection: mockCollection,
    doc: mockDoc,
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    batch: vi.fn(() => ({
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
    runTransaction: vi.fn(),
    listDocuments: mockListDocuments,
  };
}

/** Returns a mock module shape for `vi.mock("@/lib/firebase/admin", () => ...)` */
export function mockFirebaseAdmin(
  authMocks?: Partial<AdminAuthMocks>,
  dbMocks?: Partial<AdminDbMocks>
) {
  const auth = { ...createAdminAuthMocks(), ...authMocks };
  const db = { ...createAdminDbMocks(), ...dbMocks };

  return {
    getAdminAuth: () => auth,
    getAdminDb: () => db,
    _mocks: { auth, db },
  };
}

// ─── Client SDK mocks (browser-side) ───

export interface FirestoreClientMocks {
  getDoc: ReturnType<typeof vi.fn>;
  getDocs: ReturnType<typeof vi.fn>;
  setDoc: ReturnType<typeof vi.fn>;
  updateDoc: ReturnType<typeof vi.fn>;
  deleteDoc: ReturnType<typeof vi.fn>;
  doc: ReturnType<typeof vi.fn>;
  collection: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
  onSnapshot: ReturnType<typeof vi.fn>;
  runTransaction: ReturnType<typeof vi.fn>;
  getCountFromServer: ReturnType<typeof vi.fn>;
}

export function createFirestoreClientMocks(): FirestoreClientMocks {
  return {
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    onSnapshot: vi.fn(),
    runTransaction: vi.fn(),
    getCountFromServer: vi.fn(),
  };
}

/** Returns a mock for `vi.mock("firebase/firestore", () => ...)` */
export function mockFirestoreModule(overrides?: Partial<FirestoreClientMocks>) {
  const mocks = { ...createFirestoreClientMocks(), ...overrides };
  return {
    ...mocks,
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({
        toDate: () => new Date("2025-01-15T00:00:00Z"),
        toMillis: () => 1736899200000,
      })),
    },
  };
}
