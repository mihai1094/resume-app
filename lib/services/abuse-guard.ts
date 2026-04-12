import "server-only";

import { createHash } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { extractClientIp } from "@/lib/api/client-ip";

type BlockScope = "ip" | "device";

interface AbuseBlock {
  scope: BlockScope;
  idHash: string;
  reason: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface SignupCheckResult {
  allowed: boolean;
  reason?: "signup_throttled";
  retryAfterSeconds?: number;
}

export interface AIGuardResult {
  allowed: boolean;
  reason?: "ai_blocked_new_account_burst";
  retryAfterSeconds?: number;
}

export interface AbuseGuardPruneResult {
  blocksDeleted: number;
  signalDocsDeleted: number;
  prunedAt: string;
}

const COLLECTIONS = {
  blocks: "abuseBlocks",
  signupByIp: "signupSignalsByIp",
  signupByDevice: "signupSignalsByDevice",
  newAccountsByIp: "newAccountsByIp",
  newAccountsByDevice: "newAccountsByDevice",
  users: "users",
} as const;

const LIMITS = {
  // Signup throttle (1 hour rolling window)
  signupWindowMs: 60 * 60 * 1000,
  maxSignupsPerIpPerWindow: 6,
  maxSignupsPerDevicePerWindow: 4,

  // AI abuse heuristics for fresh accounts
  newAccountAgeMs: 48 * 60 * 60 * 1000,
  aiBurstWindowMs: 6 * 60 * 60 * 1000,
  maxNewAccountsPerIpForAI: 4,
  maxNewAccountsPerDeviceForAI: 3,

  // Temporary block duration
  blockDurationMs: 24 * 60 * 60 * 1000,

  // Retention window for pseudonymized abuse signals
  signalRetentionMs: 30 * 24 * 60 * 60 * 1000,
  cleanupBatchSize: 200,
} as const;

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getClientIP(request: NextRequest): string {
  return extractClientIp(request);
}

function getDeviceSource(request: NextRequest, explicitDeviceId?: string): string {
  const headerDevice = request.headers.get("x-client-device-id") || explicitDeviceId;
  if (headerDevice && headerDevice.trim().length > 0) {
    return headerDevice.trim();
  }

  // Fallback for clients that haven't sent explicit device id yet.
  const ua = request.headers.get("user-agent") || "unknown-ua";
  const lang = request.headers.get("accept-language") || "unknown-lang";
  return `ua:${ua}|lang:${lang}`;
}

function blockDocId(scope: BlockScope, idHash: string): string {
  return `${scope}_${idHash}`;
}

async function getActiveBlock(scope: BlockScope, idHash: string): Promise<AbuseBlock | null> {
  const docRef = getAdminDb()
    .collection(COLLECTIONS.blocks)
    .doc(blockDocId(scope, idHash));
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const block = snap.data() as AbuseBlock;
  const now = Date.now();
  if (!block.expiresAt || block.expiresAt.toMillis() <= now) {
    return null;
  }

  return block;
}

async function setBlock(scope: BlockScope, idHash: string, reason: string): Promise<void> {
  const now = Date.now();
  const docRef = getAdminDb()
    .collection(COLLECTIONS.blocks)
    .doc(blockDocId(scope, idHash));

  await docRef.set({
    scope,
    idHash,
    reason,
    createdAt: Timestamp.fromMillis(now),
    expiresAt: Timestamp.fromMillis(now + LIMITS.blockDurationMs),
  } as AbuseBlock);
}

async function countRecentSubcollectionDocs(
  collectionPath: string[],
  sinceMs: number
): Promise<number> {
  const ref = getAdminDb().collection(collectionPath.join("/"));
  const snap = await ref.where("createdAt", ">=", Timestamp.fromMillis(sinceMs)).get();
  return snap.size;
}

async function deleteQueryInBatches(query: FirebaseFirestore.Query): Promise<number> {
  let deletedCount = 0;

  while (true) {
    const snapshot = await query.limit(LIMITS.cleanupBatchSize).get();
    if (snapshot.empty) return deletedCount;

    const batch = getAdminDb().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deletedCount += snapshot.size;

    if (snapshot.size < LIMITS.cleanupBatchSize) return deletedCount;
  }
}

async function pruneExpiredBlocks(nowMs: number): Promise<number> {
  const query = getAdminDb()
    .collection(COLLECTIONS.blocks)
    .where("expiresAt", "<=", Timestamp.fromMillis(nowMs));
  return deleteQueryInBatches(query);
}

async function pruneExpiredCollectionGroupDocs(
  collectionGroupName: string,
  nowMs: number
): Promise<number> {
  const query = getAdminDb()
    .collectionGroup(collectionGroupName)
    .where("expiresAt", "<=", Timestamp.fromMillis(nowMs));
  return deleteQueryInBatches(query);
}

export async function pruneExpiredAbuseGuardData(
  nowMs: number = Date.now()
): Promise<AbuseGuardPruneResult> {
  const [blocksDeleted, eventDocsDeleted, userDocsDeleted] = await Promise.all([
    pruneExpiredBlocks(nowMs),
    pruneExpiredCollectionGroupDocs("events", nowMs),
    pruneExpiredCollectionGroupDocs("users", nowMs),
  ]);

  return {
    blocksDeleted,
    signalDocsDeleted: eventDocsDeleted + userDocsDeleted,
    prunedAt: new Date(nowMs).toISOString(),
  };
}

export async function checkAndRecordSignupAttempt(
  request: NextRequest,
  explicitDeviceId?: string
): Promise<SignupCheckResult> {
  const now = Date.now();
  const ipHash = hashIdentifier(getClientIP(request));
  const deviceHash = hashIdentifier(getDeviceSource(request, explicitDeviceId));

  const [ipBlock, deviceBlock] = await Promise.all([
    getActiveBlock("ip", ipHash),
    getActiveBlock("device", deviceHash),
  ]);

  if (ipBlock || deviceBlock) {
    const block = ipBlock || deviceBlock;
    return {
      allowed: false,
      reason: "signup_throttled",
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((block!.expiresAt.toMillis() - now) / 1000)
      ),
    };
  }

  const sinceMs = now - LIMITS.signupWindowMs;
  const [ipCount, deviceCount] = await Promise.all([
    countRecentSubcollectionDocs([COLLECTIONS.signupByIp, ipHash, "events"], sinceMs),
    countRecentSubcollectionDocs(
      [COLLECTIONS.signupByDevice, deviceHash, "events"],
      sinceMs
    ),
  ]);

  if (
    ipCount >= LIMITS.maxSignupsPerIpPerWindow ||
    deviceCount >= LIMITS.maxSignupsPerDevicePerWindow
  ) {
    await Promise.all([
      setBlock("ip", ipHash, "signup_rate_limit"),
      setBlock("device", deviceHash, "signup_rate_limit"),
    ]);
    return {
      allowed: false,
      reason: "signup_throttled",
      retryAfterSeconds: Math.ceil(LIMITS.blockDurationMs / 1000),
    };
  }

  await Promise.all([
    getAdminDb()
      .collection(COLLECTIONS.signupByIp)
      .doc(ipHash)
      .collection("events")
      .add({
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + LIMITS.signalRetentionMs),
        deviceHash,
      }),
    getAdminDb()
      .collection(COLLECTIONS.signupByDevice)
      .doc(deviceHash)
      .collection("events")
      .add({
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + LIMITS.signalRetentionMs),
        ipHash,
      }),
  ]);

  return { allowed: true };
}

// Short-lived per-process cache to avoid a Firestore round-trip on every AI request
// for the same user within a 30-second window. Entries are small (just the result).
const _abuseGuardCache = new Map<string, { result: AIGuardResult; expiresAt: number }>();
const ABUSE_GUARD_CACHE_TTL_MS = 30_000;

async function _enforceAiAbuseGuardUncached(
  now: number,
  ipHash: string,
  deviceHash: string,
  userId: string
): Promise<AIGuardResult> {
  const [ipBlock, deviceBlock] = await Promise.all([
    getActiveBlock("ip", ipHash),
    getActiveBlock("device", deviceHash),
  ]);

  if (ipBlock || deviceBlock) {
    const block = ipBlock || deviceBlock;
    return {
      allowed: false,
      reason: "ai_blocked_new_account_burst",
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((block!.expiresAt.toMillis() - now) / 1000)
      ),
    };
  }

  // Evaluate only "fresh" accounts — established accounts (>48h) pass immediately
  const userSnap = await getAdminDb().collection(COLLECTIONS.users).doc(userId).get();
  if (!userSnap.exists) return { allowed: true };

  const createdAt = userSnap.get("createdAt") as Timestamp | undefined;
  if (!createdAt) return { allowed: true };
  if (now - createdAt.toMillis() > LIMITS.newAccountAgeMs) return { allowed: true };

  // Record a per-user signal once per IP/device bucket.
  const ipDocRef = getAdminDb()
    .collection(COLLECTIONS.newAccountsByIp)
    .doc(ipHash)
    .collection("users")
    .doc(userId);
  const deviceDocRef = getAdminDb()
    .collection(COLLECTIONS.newAccountsByDevice)
    .doc(deviceHash)
    .collection("users")
    .doc(userId);

  await Promise.all([
    ipDocRef.create({
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + LIMITS.signalRetentionMs),
      userCreatedAt: createdAt,
      deviceHash,
      userId,
    }).catch(() => undefined),
    deviceDocRef.create({
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + LIMITS.signalRetentionMs),
      userCreatedAt: createdAt,
      ipHash,
      userId,
    }).catch(() => undefined),
  ]);

  const sinceMs = now - LIMITS.aiBurstWindowMs;
  const [ipNewAccounts, deviceNewAccounts] = await Promise.all([
    countRecentSubcollectionDocs([COLLECTIONS.newAccountsByIp, ipHash, "users"], sinceMs),
    countRecentSubcollectionDocs([COLLECTIONS.newAccountsByDevice, deviceHash, "users"], sinceMs),
  ]);

  if (
    ipNewAccounts > LIMITS.maxNewAccountsPerIpForAI ||
    deviceNewAccounts > LIMITS.maxNewAccountsPerDeviceForAI
  ) {
    await Promise.all([
      setBlock("ip", ipHash, "new_account_burst_on_ai"),
      setBlock("device", deviceHash, "new_account_burst_on_ai"),
    ]);
    return {
      allowed: false,
      reason: "ai_blocked_new_account_burst",
      retryAfterSeconds: Math.ceil(LIMITS.blockDurationMs / 1000),
    };
  }

  return { allowed: true };
}

export async function enforceAiAbuseGuard(
  request: NextRequest,
  userId: string
): Promise<AIGuardResult> {
  const now = Date.now();
  const ipHash = hashIdentifier(getClientIP(request));
  const deviceHash = hashIdentifier(getDeviceSource(request));

  // Fast path: return cached result within TTL window for the same user+IP+device
  const cacheKey = `${userId}:${ipHash}:${deviceHash}`;
  const cached = _abuseGuardCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  const result = await _enforceAiAbuseGuardUncached(now, ipHash, deviceHash, userId);

  // Cache allow results for 30s; do not cache blocks (they have their own TTL in Firestore)
  if (result.allowed) {
    _abuseGuardCache.set(cacheKey, { result, expiresAt: now + ABUSE_GUARD_CACHE_TTL_MS });
  }

  return result;
}
