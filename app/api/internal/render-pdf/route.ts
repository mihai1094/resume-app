import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { renderHtmlToPdf } from "@/lib/services/pdf-renderer";

// Vercel serverless config — allow enough time and memory for Chromium
export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_HTML_BYTES = 1024 * 1024;

function secretsMatch(
  providedSecret: string | null,
  expectedSecret: string
): boolean {
  if (!providedSecret) return false;

  const providedBuffer = Buffer.from(providedSecret);
  const expectedBuffer = Buffer.from(expectedSecret);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Internal PDF rendering endpoint.
 * Accepts a self-contained HTML string and returns a PDF buffer.
 * Protected by an internal secret — not user-facing.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const secret = request.headers.get("x-internal-secret");
    const expected = process.env.INTERNAL_API_SECRET;

    if (!expected) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    if (!secretsMatch(secret, expected)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await applyRateLimit(request, "GENERAL");
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    const { html } = await request.json();

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'html' field" },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "HTML payload too large" },
        { status: 413 }
      );
    }

    const pdfBuffer = await renderHtmlToPdf(html);
    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF rendering failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
