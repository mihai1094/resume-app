/**
 * Server-side sharing service
 *
 * Uses Firebase Admin SDK (server-only) to increment counters on publicResumes.
 * Client SDK writes fail silently because Firestore rules require authentication;
 * Admin SDK bypasses rules and writes atomically from a trusted server context.
 */

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/lib/services/logger";

const sharingServerLogger = logger.child({ module: "SharingServiceServer" });

export async function incrementViewCountServer(resumeId: string): Promise<void> {
  try {
    await getAdminDb()
      .collection("publicResumes")
      .doc(resumeId)
      .update({ viewCount: FieldValue.increment(1), lastUpdated: new Date() });
  } catch (error) {
    sharingServerLogger.error(
      "Failed to increment view count",
      error instanceof Error ? error : new Error(String(error)),
      { resumeId }
    );
  }
}

export async function incrementDownloadCountServer(resumeId: string): Promise<void> {
  try {
    await getAdminDb()
      .collection("publicResumes")
      .doc(resumeId)
      .update({ downloadCount: FieldValue.increment(1), lastUpdated: new Date() });
  } catch (error) {
    sharingServerLogger.error(
      "Failed to increment download count",
      error instanceof Error ? error : new Error(String(error)),
      { resumeId }
    );
  }
}
