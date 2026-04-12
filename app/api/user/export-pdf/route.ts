import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { handleApiError } from "@/lib/api/error-handler";
import {
  serializeTemplate,
  serializeCoverLetterTemplate,
} from "@/lib/services/template-serializer";
import {
  renderHtmlToPdf,
  TRUSTED_PDF_ASSET_HOSTS,
} from "@/lib/services/pdf-renderer";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { CoverLetterTemplateId } from "@/lib/types/cover-letter";
import { logger } from "@/lib/services/logger";

const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB

const exportBodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
  templateId: z.string().optional(),
  customization: z.record(z.string(), z.unknown()).optional(),
  documentType: z.enum(["cover-letter"]).optional(),
});

export const maxDuration = 60;

const exportLogger = logger.child({ module: "ExportPdf" });

const VALID_RESUME_TEMPLATES = new Set([
  "modern", "classic", "executive", "minimalist", "creative", "technical",
  "timeline", "ivy", "ats-clarity", "ats-structured", "ats-compact",
  "dublin", "infographic", "cubic", "bold", "simple",
  "iconic", "student", "functional", "notion", "nordic", "horizon",
]);

const VALID_COVER_LETTER_TEMPLATES = new Set([
  "modern", "classic", "minimalist", "executive",
]);

/**
 * User-facing PDF export endpoint.
 * Handles both resume and cover letter exports.
 * Serializes the HTML template, renders via headless Chromium, returns PDF.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return auth.response;
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const rawBody = await request.json();
    const parsed = exportBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { data, templateId, customization, documentType } = parsed.data;

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Missing document data" },
        { status: 400 }
      );
    }

    const userId = auth.user.uid;
    let html: string;
    let filename: string;

    if (documentType === "cover-letter") {
      const safeTemplateId: CoverLetterTemplateId = (
        templateId && VALID_COVER_LETTER_TEMPLATES.has(templateId)
          ? templateId
          : "modern"
      ) as CoverLetterTemplateId;

      exportLogger.info("Starting cover letter PDF export", {
        userId,
        templateId: safeTemplateId,
      });

      html = await serializeCoverLetterTemplate(data as any, safeTemplateId);
      filename = "cover-letter.pdf";
    } else {
      if (!data.personalInfo) {
        return NextResponse.json(
          { error: "Missing resume data" },
          { status: 400 }
        );
      }

      const safeTemplateId: TemplateId = (
        templateId && VALID_RESUME_TEMPLATES.has(templateId)
          ? templateId
          : "modern"
      ) as TemplateId;

      exportLogger.info("Starting resume PDF export", {
        userId,
        templateId: safeTemplateId,
      });

      html = await serializeTemplate(
        data as unknown as ResumeData,
        safeTemplateId,
        customization as any
      );
      filename = "resume.pdf";
    }

    const pdfBuffer = await renderHtmlToPdf(html, {
      allowedHosts: TRUSTED_PDF_ASSET_HOSTS,
    });
    const uint8 = new Uint8Array(pdfBuffer);

    exportLogger.info("PDF export complete", {
      userId,
      sizeBytes: pdfBuffer.byteLength,
    });

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    exportLogger.error("PDF export failed", error);
    return handleApiError(error);
  }
}
