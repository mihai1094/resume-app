import { NextRequest, NextResponse } from "next/server";
import { parseLinkedInPDF } from "@/lib/parsers/linkedin-pdf-parser";
import { verifyAuth } from "@/lib/api/auth-middleware";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "application/pdf",
];

// PDF magic bytes (header signature)
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

/**
 * Validate that the file is actually a PDF by checking magic bytes
 */
async function isPDFFile(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return PDF_MAGIC_BYTES.every((byte, index) => bytes[index] === byte);
  } catch {
    return false;
  }
}

/**
 * POST /api/parse-linkedin-pdf
 * Parse LinkedIn PDF export to extract resume data
 *
 * Security features:
 * - Authentication required
 * - File type validation (MIME type + magic bytes)
 * - File size limit (5MB)
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        },
        { status: 400 }
      );
    }

    // Validate file size is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "File is empty" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PDF files are allowed"
        },
        { status: 400 }
      );
    }

    // Validate file content (magic bytes check)
    const isValidPDF = await isPDFFile(file);
    if (!isValidPDF) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid PDF file. The file does not appear to be a valid PDF"
        },
        { status: 400 }
      );
    }

    // Validate filename (prevent path traversal)
    const filename = file.name;
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Invalid filename" },
        { status: 400 }
      );
    }

    const result = await parseLinkedInPDF(file);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to parse PDF",
      },
      { status: 400 }
    );
  }
}
