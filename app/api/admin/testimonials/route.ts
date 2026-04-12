import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { isAdminUser } from "@/lib/config/admin";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { updateTestimonialStatus } from "@/lib/services/testimonials-server";
import type { TestimonialStatus } from "@/lib/types/testimonial";

const VALID_STATUSES: TestimonialStatus[] = ["pending", "approved", "rejected"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  if (!isAdminUser(auth.user.email)) {
    return NextResponse.json(
      { error: "Admin access required", code: "ADMIN_REQUIRED" },
      { status: 403 }
    );
  }

  try {
    await applyRateLimit(request, "GENERAL", auth.user.uid);
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  try {
    const body = (await request.json()) as {
      testimonialId?: string;
      status?: TestimonialStatus;
    };

    if (!body.testimonialId || !body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "testimonialId and a valid status are required." },
        { status: 400 }
      );
    }

    await updateTestimonialStatus(
      body.testimonialId,
      body.status,
      auth.user.email ?? "unknown-admin"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      module: "AdminTestimonials",
      action: "update-status",
    });
  }
}
