import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import {
  getApprovedTestimonials,
  submitTestimonial,
} from "@/lib/services/testimonials-server";
import type { TestimonialSubmissionInput } from "@/lib/types/testimonial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 80;
const MAX_ROLE_LENGTH = 80;
const MAX_COMPANY_LENGTH = 80;
const MAX_CONTENT_LENGTH = 400;

export async function GET() {
  try {
    const testimonials = await getApprovedTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    return handleApiError(error, {
      module: "Testimonials",
      action: "list-public",
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  try {
    await applyRateLimit(request, "GENERAL", auth.user.uid);
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  try {
    const body = (await request.json()) as Partial<TestimonialSubmissionInput>;

    const name = body.name?.trim().slice(0, MAX_NAME_LENGTH) ?? "";
    const role = body.role?.trim().slice(0, MAX_ROLE_LENGTH) ?? "";
    const company = body.company?.trim().slice(0, MAX_COMPANY_LENGTH) ?? "";
    const content = body.content?.trim().slice(0, MAX_CONTENT_LENGTH) ?? "";
    const rating = typeof body.rating === "number" ? body.rating : 0;
    const consentToPublish = body.consentToPublish === true;

    if (!name || !role || !company || !content || !consentToPublish) {
      return NextResponse.json(
        { error: "Name, role, company, content, and consent are required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    const testimonial = await submitTestimonial(
      {
        name,
        role,
        company,
        content,
        rating,
        consentToPublish,
      },
      auth.user
    );

    return NextResponse.json({ success: true, testimonialId: testimonial.id });
  } catch (error) {
    return handleApiError(error, {
      module: "Testimonials",
      action: "submit",
    });
  }
}
