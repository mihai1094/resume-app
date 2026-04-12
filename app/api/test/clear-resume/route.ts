import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { testRouteGuard } from "../guard";

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const body = await request.json().catch(() => ({}));
  const resumeId = (body as { resumeId?: string }).resumeId;

  if (!resumeId || typeof resumeId !== "string") {
    return NextResponse.json(
      { error: "resumeId is required" },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const ref = db
    .collection("users")
    .doc(user.uid)
    .collection("savedResumes")
    .doc(resumeId);

  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json(
      { error: "Resume not found" },
      { status: 404 }
    );
  }

  await ref.delete();

  return NextResponse.json({ success: true, deletedId: resumeId });
}
