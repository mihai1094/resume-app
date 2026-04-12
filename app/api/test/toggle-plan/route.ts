import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { testRouteGuard } from "../guard";

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();
  const userRef = db.collection("users").doc(user.uid);

  const userDoc = await userRef.get();
  const currentPlan = userDoc.data()?.plan ?? "free";
  const newPlan = currentPlan === "premium" ? "free" : "premium";

  await userRef.set(
    {
      plan: newPlan,
      subscription: {
        plan: newPlan,
        status: "active",
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({
    success: true,
    previousPlan: currentPlan,
    currentPlan: newPlan,
  });
}
