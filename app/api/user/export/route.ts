import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { getAdminDb } from "@/lib/firebase/admin";

function serializeForJson(value: unknown): unknown {
  if (value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(serializeForJson);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        serializeForJson(entry),
      ])
    );
  }

  return value;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(auth.user.uid).get();
  const accountMetadata = userSnap.exists
    ? (serializeForJson(userSnap.data()) as Record<string, unknown>)
    : {};

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      uid: auth.user.uid,
      email: auth.user.email,
      emailVerified: auth.user.emailVerified,
      ...accountMetadata,
    },
  };

  return NextResponse.json(data);
}
