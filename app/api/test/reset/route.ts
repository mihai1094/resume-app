import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { testRouteGuard } from "../guard";

/**
 * Delete all test user data (resumes, cover letters) and re-trigger seed.
 */
export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();

  // Delete all saved resumes
  const resumesSnap = await db
    .collection("users")
    .doc(user.uid)
    .collection("savedResumes")
    .listDocuments();

  const batch = db.batch();
  for (const doc of resumesSnap) {
    batch.delete(doc);
  }

  // Delete all saved cover letters
  const coverLettersSnap = await db
    .collection("users")
    .doc(user.uid)
    .collection("savedCoverLetters")
    .listDocuments();

  for (const doc of coverLettersSnap) {
    batch.delete(doc);
  }

  // Delete current resume (autosave)
  const currentResumeRef = db
    .collection("users")
    .doc(user.uid)
    .collection("resumes")
    .doc("current");
  batch.delete(currentResumeRef);

  await batch.commit();

  // Re-seed by forwarding to the seed endpoint
  const seedUrl = new URL("/api/test/seed", request.url);
  const seedRequest = new NextRequest(seedUrl, {
    method: "POST",
    headers: request.headers,
  });

  const { POST: seedHandler } = await import("../seed/route");
  return seedHandler(seedRequest);
}
