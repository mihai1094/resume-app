import "server-only";

import { FieldPath, Query } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { logger } from "@/lib/services/logger";

const deletionLogger = logger.child({ module: "AccountDeletion" });

const COLLECTIONS = {
  users: "users",
  resumes: "resumes",
  savedResumes: "savedResumes",
  savedCoverLetters: "savedCoverLetters",
  publicResumes: "publicResumes",
  analytics: "analytics",
  events: "events",
  usernames: "usernames",
  newAccountsByIp: "newAccountsByIp",
  newAccountsByDevice: "newAccountsByDevice",
} as const;

const BATCH_DELETE_LIMIT = 200;

async function deleteQueryInBatches(
  baseQuery: Query,
  batchSize: number = BATCH_DELETE_LIMIT
): Promise<number> {
  const db = getAdminDb();
  let deletedCount = 0;

  while (true) {
    const snapshot = await baseQuery.limit(batchSize).get();
    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deletedCount += snapshot.size;

    if (snapshot.size < batchSize) {
      break;
    }
  }

  return deletedCount;
}

async function deleteCollectionPath(path: string): Promise<number> {
  const query = getAdminDb().collection(path);
  return deleteQueryInBatches(query);
}

async function deleteResumeAnalytics(resumeId: string): Promise<boolean> {
  const deletedEvents = await deleteCollectionPath(
    `${COLLECTIONS.analytics}/${resumeId}/${COLLECTIONS.events}`
  );
  const analyticsRef = getAdminDb().collection(COLLECTIONS.analytics).doc(resumeId);
  const analyticsSnap = await analyticsRef.get();
  if (analyticsSnap.exists) {
    await analyticsRef.delete();
  }
  return deletedEvents > 0 || analyticsSnap.exists;
}

async function deleteUserLinkedAbuseSignals(userId: string): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db
    .collectionGroup(COLLECTIONS.users)
    .where(FieldPath.documentId(), "==", userId)
    .get();

  const refs = snapshot.docs
    .map((doc) => doc.ref)
    .filter(
      (ref) =>
        ref.path.startsWith(`${COLLECTIONS.newAccountsByIp}/`) ||
        ref.path.startsWith(`${COLLECTIONS.newAccountsByDevice}/`)
    );

  if (refs.length === 0) {
    return 0;
  }

  let deleted = 0;
  for (let i = 0; i < refs.length; i += BATCH_DELETE_LIMIT) {
    const batch = db.batch();
    const slice = refs.slice(i, i + BATCH_DELETE_LIMIT);
    slice.forEach((ref) => batch.delete(ref));
    await batch.commit();
    deleted += slice.length;
  }

  return deleted;
}

export interface AccountDeletionResult {
  success: boolean;
  details: {
    publicResumesDeleted: number;
    analyticsDocumentsDeleted: number;
    usernamesDeleted: number;
    abuseSignalsDeleted: number;
  };
}

class AccountDeletionService {
  async deleteAccount(userId: string): Promise<AccountDeletionResult> {
    const db = getAdminDb();
    const userRef = db.collection(COLLECTIONS.users).doc(userId);
    const userSnap = await userRef.get();
    const usernameFromUserDoc =
      userSnap.exists && typeof userSnap.get("username") === "string"
        ? (userSnap.get("username") as string).toLowerCase()
        : null;

    const savedResumesSnapshot = await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .collection(COLLECTIONS.savedResumes)
      .get();

    // Delete published resumes and analytics linked to them.
    const publicResumesSnapshot = await db
      .collection(COLLECTIONS.publicResumes)
      .where("userId", "==", userId)
      .get();
    const analyticsByUserSnapshot = await db
      .collection(COLLECTIONS.analytics)
      .where("userId", "==", userId)
      .get();

    const resumeIdsForAnalytics = new Set<string>();
    for (const savedResumeDoc of savedResumesSnapshot.docs) {
      resumeIdsForAnalytics.add(savedResumeDoc.id);
    }
    for (const publicResumeDoc of publicResumesSnapshot.docs) {
      resumeIdsForAnalytics.add(publicResumeDoc.id);
    }
    for (const analyticsDoc of analyticsByUserSnapshot.docs) {
      resumeIdsForAnalytics.add(analyticsDoc.id);
    }

    let analyticsDocumentsDeleted = 0;
    for (const resumeId of resumeIdsForAnalytics) {
      const deleted = await deleteResumeAnalytics(resumeId);
      if (deleted) {
        analyticsDocumentsDeleted += 1;
      }
    }

    for (const publicResumeDoc of publicResumesSnapshot.docs) {
      await publicResumeDoc.ref.delete();
    }

    // Delete username index entries.
    const usernameByUserQuery = db
      .collection(COLLECTIONS.usernames)
      .where("userId", "==", userId);
    const usernamesDeletedByQuery = await deleteQueryInBatches(usernameByUserQuery);
    let usernamesDeleted = usernamesDeletedByQuery;

    if (usernameFromUserDoc) {
      const usernameRef = db
        .collection(COLLECTIONS.usernames)
        .doc(usernameFromUserDoc);
      const usernameSnap = await usernameRef.get();
      if (usernameSnap.exists) {
        await usernameRef.delete();
        usernamesDeleted += 1;
      }
    }

    // Delete user-owned content collections.
    await deleteCollectionPath(
      `${COLLECTIONS.users}/${userId}/${COLLECTIONS.savedResumes}`
    );
    await deleteCollectionPath(
      `${COLLECTIONS.users}/${userId}/${COLLECTIONS.savedCoverLetters}`
    );
    await deleteCollectionPath(`${COLLECTIONS.users}/${userId}/${COLLECTIONS.resumes}`);

    // Delete extra abuse guard markers linked to this user.
    const abuseSignalsDeleted = await deleteUserLinkedAbuseSignals(userId);

    // Remove user metadata doc.
    await userRef.delete();

    // Delete Firebase Auth account last; tolerate already-deleted user for idempotency.
    try {
      await getAdminAuth().deleteUser(userId);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/user-not-found") {
        throw error;
      }
    }

    deletionLogger.info("Account deleted", {
      userId,
      publicResumesDeleted: publicResumesSnapshot.size,
      analyticsDocumentsDeleted,
      usernamesDeleted,
      abuseSignalsDeleted,
    });

    return {
      success: true,
      details: {
        publicResumesDeleted: publicResumesSnapshot.size,
        analyticsDocumentsDeleted,
        usernamesDeleted,
        abuseSignalsDeleted,
      },
    };
  }
}

export const accountDeletionService = new AccountDeletionService();
