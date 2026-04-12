import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: vi.fn(),
}));

import { getAdminDb } from "@/lib/firebase/admin";
import {
  confirmCredits,
  refundCredits,
  reserveCredits,
} from "../credit-service-server";

type InMemoryUserDoc = {
  plan?: string;
  usage?: {
    aiCreditsUsed: number;
    aiCreditsResetDate: string;
    lastCreditReset: string;
  };
  updatedAt?: unknown;
};

function mergeData(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      mergeData(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
      continue;
    }

    target[key] = value;
  }

  return target;
}

describe("credit-service-server", () => {
  let userDoc: InMemoryUserDoc;
  let idempotencyDocs: Record<string, Record<string, unknown>>;
  let txQueue: Promise<unknown>;

  beforeEach(() => {
    userDoc = {
      plan: "free",
      usage: {
        aiCreditsUsed: 0,
        aiCreditsResetDate: "2099-01-01T00:00:00.000Z",
        lastCreditReset: "2026-03-01T00:00:00.000Z",
      },
    };
    idempotencyDocs = {};
    txQueue = Promise.resolve();

    const makeChildDocRef = (docId: string) => ({
      __docId: docId,
      get: vi.fn(async () => ({
        exists: docId in idempotencyDocs,
        data: () => structuredClone(idempotencyDocs[docId]),
      })),
      set: vi.fn(async (payload: Record<string, unknown>) => {
        idempotencyDocs[docId] = structuredClone(payload);
      }),
      delete: vi.fn(async () => {
        delete idempotencyDocs[docId];
      }),
    });

    const docRef = {
      get: vi.fn(async () => ({
        exists: true,
        data: () => structuredClone(userDoc),
      })),
      set: vi.fn(async (payload: Record<string, unknown>) => {
        mergeData(userDoc as Record<string, unknown>, structuredClone(payload));
      }),
      collection: vi.fn(() => ({
        doc: vi.fn((docId: string) => makeChildDocRef(docId)),
      })),
    };

    const db = {
      collection: vi.fn(() => ({
        doc: vi.fn(() => docRef),
      })),
      runTransaction: vi.fn(
        async (
          callback: (tx: {
            get: (
              ref: typeof docRef | ReturnType<typeof makeChildDocRef>
            ) => Promise<{ exists?: boolean; data: () => InMemoryUserDoc | Record<string, unknown> }>;
            set: (
              ref: typeof docRef | ReturnType<typeof makeChildDocRef>,
              payload: Record<string, unknown>,
              options?: { merge?: boolean }
            ) => void;
            delete: (ref: ReturnType<typeof makeChildDocRef>) => void;
          }) => Promise<unknown>
        ) => {
          let result: unknown;

          txQueue = txQueue.then(async () => {
            const tx = {
              get: async (ref: {
                get: () => Promise<{
                  exists?: boolean;
                  data: () => InMemoryUserDoc | Record<string, unknown>;
                }>;
              }) => ref.get(),
              set: (
                ref: typeof docRef | ReturnType<typeof makeChildDocRef>,
                payload: Record<string, unknown>
              ) => {
                if ("collection" in ref) {
                  mergeData(userDoc as Record<string, unknown>, structuredClone(payload));
                  return;
                }

                idempotencyDocs[ref.__docId] = structuredClone(payload);
              },
              delete: (ref: ReturnType<typeof makeChildDocRef>) => {
                delete idempotencyDocs[ref.__docId];
              },
            };

            result = await callback(tx);
          });

          await txQueue;
          return result;
        }
      ),
    };

    vi.mocked(getAdminDb).mockReturnValue(db as never);
  });

  it("checks credit availability without deducting usage", async () => {
    const result = await reserveCredits("user-1", "generate-summary");

    expect(result.success).toBe(true);
    expect(result.creditsRemaining).toBe(30);
    expect(userDoc.usage?.aiCreditsUsed).toBe(0);
  });

  it("applies concurrent deductions atomically", async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        confirmCredits("user-1", "generate-cover-letter")
      )
    );

    expect(results.filter((result) => result.success)).toHaveLength(6);
    expect(
      results.filter(
        (result) => !result.success && result.reason === "insufficient_credits"
      )
    ).toHaveLength(4);
    expect(userDoc.usage?.aiCreditsUsed).toBe(30);
  });

  it("refunds a charged operation back to the prior balance", async () => {
    const charged = await confirmCredits(
      "user-1",
      "generate-summary",
      "free",
      "request-1"
    );

    expect(charged.success).toBe(true);
    expect(userDoc.usage?.aiCreditsUsed).toBe(2);

    const refunded = await refundCredits(
      "user-1",
      "generate-summary",
      "free",
      "request-1"
    );

    expect(refunded.success).toBe(true);
    expect(refunded.creditsUsed).toBe(0);
    expect(userDoc.usage?.aiCreditsUsed).toBe(0);
  });
});
