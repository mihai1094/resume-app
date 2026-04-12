import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { testRouteGuard } from "../guard";

export async function GET(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();

  const userDoc = await db.collection("users").doc(user.uid).get();
  const userData = userDoc.data() ?? {};

  const resumesSnap = await db
    .collection("users")
    .doc(user.uid)
    .collection("savedResumes")
    .listDocuments();

  const coverLettersSnap = await db
    .collection("users")
    .doc(user.uid)
    .collection("savedCoverLetters")
    .listDocuments();

  return NextResponse.json({
    plan: userData.plan ?? "free",
    aiCreditsUsed: userData.usage?.aiCreditsUsed ?? 0,
    aiCreditsResetDate: userData.usage?.aiCreditsResetDate ?? null,
    resumeCount: resumesSnap.length,
    resumeIds: resumesSnap.map((d) => d.id),
    coverLetterCount: coverLettersSnap.length,
  });
}
