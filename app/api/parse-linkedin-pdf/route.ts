import { NextRequest, NextResponse } from "next/server";

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

    // Dynamic import only when the endpoint is called to avoid canvas issues
    const { parseLinkedInPDF } = await import(
      "@/lib/parsers/linkedin-pdf-parser"
    );
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
