import { NextRequest, NextResponse } from "next/server";

// Dynamic import to avoid canvas issues during build
async function parseLinkedInPDF(file: File) {
  const { parseLinkedInPDF: parse } = await import(
    "@/lib/parsers/linkedin-pdf-parser"
  );
  return parse(file);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
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
