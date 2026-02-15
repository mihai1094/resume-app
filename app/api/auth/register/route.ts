import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { checkAndRecordSignupAttempt } from "@/lib/services/abuse-guard";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80),
  deviceId: z.string().min(8).max(128).optional(),
});

function hasStrongPassword(password: string): boolean {
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

async function createUserMetadata(uid: string, email: string, displayName: string) {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .set({
      email,
      displayName,
      plan: "free",
      subscription: {
        plan: "free",
        status: "active",
      },
      usage: {
        aiCreditsUsed: 0,
        aiCreditsResetDate: getNextResetDate(),
        lastCreditReset: new Date().toISOString(),
      },
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    try {
      await applyRateLimit(request, "GENERAL");
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration payload", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { email, password, displayName, deviceId } = parsed.data;
    if (!hasStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must include uppercase, lowercase, number, and special character.",
          code: "WEAK_PASSWORD",
        },
        { status: 400 }
      );
    }

    const signupCheck = await checkAndRecordSignupAttempt(request, deviceId);
    if (!signupCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many signup attempts from this network/device.",
          code: "SIGNUP_THROTTLED",
          retryAfterSeconds: signupCheck.retryAfterSeconds ?? 3600,
        },
        { status: 429 }
      );
    }

    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false,
    });

    try {
      await createUserMetadata(userRecord.uid, email, displayName);
    } catch (metadataError) {
      await adminAuth.deleteUser(userRecord.uid).catch(() => undefined);
      throw metadataError;
    }

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      customToken,
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? "");

    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "This email is already registered.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    if (code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Invalid email address.", code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    if (code === "auth/invalid-password") {
      return NextResponse.json(
        { error: "Invalid password.", code: "INVALID_PASSWORD" },
        { status: 400 }
      );
    }

    if (
      errorMessage.includes("Could not load the default credentials") ||
      errorMessage.includes("FIREBASE_SERVICE_ACCOUNT_KEY") ||
      errorMessage.includes("application default credentials")
    ) {
      return NextResponse.json(
        {
          error:
            "Server authentication is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY in environment variables.",
          code: "FIREBASE_ADMIN_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    console.error("[Auth/Register] Failed:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again.", code: "REGISTER_FAILED" },
      { status: 500 }
    );
  }
}
