/**
 * Firestore Security Rules Tests
 *
 * Run with the Firebase emulator:
 *   firebase emulators:exec --only firestore "pnpm test -- tests/firestore-rules.test.ts"
 *
 * Or start the emulator separately:
 *   firebase emulators:start --only firestore
 * and then: pnpm test -- tests/firestore-rules.test.ts
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { setDoc, getDoc, updateDoc, doc } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ID = "resumezeus-test";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesContent = readFileSync(
    resolve(process.cwd(), "firestore.rules"),
    "utf8"
  );

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function asUser(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function asAnon() {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedUserData(uid: string, data: Record<string, unknown> = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users", uid), {
      email: `${uid}@example.com`,
      displayName: "Test User",
      createdAt: new Date(),
      ...data,
    });
  });
}

async function seedUsername(username: string, userId: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "usernames", username), { userId });
  });
}

async function seedPublicResume(resumeId: string, userId: string, username: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "publicResumes", resumeId), {
      resumeId,
      userId,
      username,
      slug: "test-resume",
      isPublic: true,
      viewCount: 0,
      downloadCount: 0,
      publishedAt: new Date(),
      lastUpdated: new Date(),
      data: {},
      templateId: "modern",
    });
  });
}

async function seedSavedResume(userId: string, resumeId: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(ctx.firestore(), "users", userId, "savedResumes", resumeId),
      {
        userId,
        name: "My Resume",
        templateId: "modern",
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests: users/{uid} — billing / usage field protection
// ─────────────────────────────────────────────────────────────────────────────

describe("users/{uid} — billing field protection", () => {
  it("denies client write to top-level aiCreditsUsed", async () => {
    const uid = "user-1";
    await seedUserData(uid);
    const db = asUser(uid);
    await assertFails(
      updateDoc(doc(db, "users", uid), { aiCreditsUsed: 0 })
    );
  });

  it("denies client write to top-level plan", async () => {
    const uid = "user-1";
    await seedUserData(uid);
    const db = asUser(uid);
    await assertFails(updateDoc(doc(db, "users", uid), { plan: "premium" }));
  });

  it("denies client write to top-level subscription", async () => {
    const uid = "user-1";
    await seedUserData(uid);
    const db = asUser(uid);
    await assertFails(
      updateDoc(doc(db, "users", uid), { subscription: { status: "active" } })
    );
  });

  it("denies client write to nested usage field", async () => {
    const uid = "user-1";
    await seedUserData(uid);
    const db = asUser(uid);
    await assertFails(
      updateDoc(doc(db, "users", uid), { "usage.aiCreditsUsed": 0 })
    );
  });

  it("allows client to update displayName", async () => {
    const uid = "user-1";
    await seedUserData(uid);
    const db = asUser(uid);
    await assertSucceeds(
      updateDoc(doc(db, "users", uid), { displayName: "New Name" })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: publicResumes — username ownership validation
// ─────────────────────────────────────────────────────────────────────────────

describe("publicResumes — username ownership", () => {
  it("denies create when username belongs to another user", async () => {
    await seedUsername("alice", "uid-alice");
    const db = asUser("uid-bob"); // bob tries to publish with alice's username

    await assertFails(
      setDoc(doc(db, "publicResumes", "resume-bob"), {
        resumeId: "resume-bob",
        userId: "uid-bob",
        username: "alice", // alice's username
        slug: "my-resume",
        isPublic: true,
        viewCount: 0,
        downloadCount: 0,
        publishedAt: new Date(),
        lastUpdated: new Date(),
        data: {},
        templateId: "modern",
      })
    );
  });

  it("allows create when username belongs to the authenticated user", async () => {
    await seedUsername("bob", "uid-bob");
    const db = asUser("uid-bob");

    await assertSucceeds(
      setDoc(doc(db, "publicResumes", "resume-bob"), {
        resumeId: "resume-bob",
        userId: "uid-bob",
        username: "bob",
        slug: "my-resume",
        isPublic: true,
        viewCount: 0,
        downloadCount: 0,
        publishedAt: new Date(),
        lastUpdated: new Date(),
        data: {},
        templateId: "modern",
      })
    );
  });

  it("denies update by non-owner", async () => {
    await seedUsername("alice", "uid-alice");
    await seedPublicResume("resume-alice", "uid-alice", "alice");
    const db = asUser("uid-bob");

    await assertFails(
      updateDoc(doc(db, "publicResumes", "resume-alice"), {
        userId: "uid-bob",
        username: "alice",
        slug: "hijacked-slug",
      })
    );
  });

  it("allows owner to update their own public resume", async () => {
    await seedUsername("alice", "uid-alice");
    await seedPublicResume("resume-alice", "uid-alice", "alice");
    const db = asUser("uid-alice");

    await assertSucceeds(
      updateDoc(doc(db, "publicResumes", "resume-alice"), {
        userId: "uid-alice",
        username: "alice",
        slug: "updated-slug",
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: savedResumes — cross-user read denied
// ─────────────────────────────────────────────────────────────────────────────

describe("savedResumes — cross-user access", () => {
  it("denies another user from reading savedResumes", async () => {
    await seedSavedResume("uid-alice", "resume-1");
    const db = asUser("uid-bob");

    await assertFails(
      getDoc(doc(db, "users", "uid-alice", "savedResumes", "resume-1"))
    );
  });

  it("allows owner to read their own savedResumes", async () => {
    await seedSavedResume("uid-alice", "resume-1");
    const db = asUser("uid-alice");

    await assertSucceeds(
      getDoc(doc(db, "users", "uid-alice", "savedResumes", "resume-1"))
    );
  });

  it("denies unauthenticated user from reading savedResumes", async () => {
    await seedSavedResume("uid-alice", "resume-1");
    const db = asAnon();

    await assertFails(
      getDoc(doc(db, "users", "uid-alice", "savedResumes", "resume-1"))
    );
  });
});
