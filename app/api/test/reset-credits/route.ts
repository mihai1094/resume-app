import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { testRouteGuard } from "../guard";

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);

  await db
    .collection("users")
    .doc(user.uid)
    .set(
      {
        usage: {
          aiCreditsUsed: 0,
          aiCreditsResetDate: nextMonth.toISOString(),
          lastCreditReset: new Date().toISOString(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return NextResponse.json({
    success: true,
    aiCreditsUsed: 0,
    aiCreditsResetDate: nextMonth.toISOString(),
  });
}
