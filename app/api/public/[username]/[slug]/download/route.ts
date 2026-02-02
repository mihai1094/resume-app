import { NextRequest, NextResponse } from "next/server";
import { sharingService } from "@/lib/services/sharing-service";
import { analyticsService } from "@/lib/services/analytics-service";
import { exportToPDF } from "@/lib/services/export";

interface RouteContext {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { username, slug } = await context.params;

    // Get the public resume
    const publicResume = await sharingService.getPublicResumeBySlug(
      username,
      slug
    );

    if (!publicResume || !publicResume.isPublic) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Increment download count (legacy counter)
    await sharingService.incrementDownloadCount(publicResume.resumeId);

    // Track download event with metadata
    const referrer = request.headers.get("referer") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      undefined;

    await analyticsService.trackEvent(publicResume.resumeId, {
      type: "download",
      source: analyticsService.determineSource(referrer),
      country,
      referrer: referrer || undefined,
      userAgent: userAgent || undefined,
    });

    // Generate PDF
    const result = await exportToPDF(
      publicResume.data,
      publicResume.templateId,
      {
        customization: {
          primaryColor: publicResume.customization.primaryColor,
          secondaryColor: publicResume.customization.secondaryColor,
          accentColor: publicResume.customization.accentColor,
          fontFamily: publicResume.customization.fontFamily,
          fontSize: publicResume.customization.fontSize,
          lineSpacing: publicResume.customization.lineSpacing,
          sectionSpacing: publicResume.customization.sectionSpacing,
        },
      }
    );

    if (!result.success || !result.blob) {
      return NextResponse.json(
        { error: result.error || "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Convert blob to array buffer
    const arrayBuffer = await result.blob.arrayBuffer();

    // Return PDF as response
    const { personalInfo } = publicResume.data;
    const sanitizePart = (value: string | undefined) =>
      (value || "")
        .replace(/[^a-zA-Z0-9-_]+/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50);

    const firstName = sanitizePart(personalInfo.firstName);
    const lastName = sanitizePart(personalInfo.lastName);
    const nameParts = [firstName, lastName].filter(Boolean);
    const fileName =
      nameParts.length > 0
        ? `${nameParts.join("_")}_Resume.pdf`
        : "Resume.pdf";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
