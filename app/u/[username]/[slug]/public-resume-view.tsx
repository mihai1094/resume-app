"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { PublicResume } from "@/lib/types/sharing";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import Link from "next/link";
import { toast } from "sonner";
import { TrafficSource } from "@/lib/types/analytics";

// Template imports
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { TechnicalTemplate } from "@/components/resume/templates/technical-template";
import { AdaptiveTemplate } from "@/components/resume/templates/adaptive-template";
import { TimelineTemplate } from "@/components/resume/templates/timeline-template";
import { IvyTemplate } from "@/components/resume/templates/ivy-template";
import { ATSClarityTemplate } from "@/components/resume/templates/ats-clarity-template";
import { ATSStructuredTemplate } from "@/components/resume/templates/ats-structured-template";
import { ATSCompactTemplate } from "@/components/resume/templates/ats-compact-template";
import { CascadeTemplate } from "@/components/resume/templates/cascade-template";
import { DublinTemplate } from "@/components/resume/templates/dublin-template";
import { InfographicTemplate } from "@/components/resume/templates/infographic-template";
import { CubicTemplate } from "@/components/resume/templates/cubic-template";
import { BoldTemplate } from "@/components/resume/templates/bold-template";

interface PublicResumeViewProps {
  resume: PublicResume;
  username: string;
  slug: string;
}

/**
 * Determine traffic source from URL params or referrer
 */
function determineSource(referrer?: string): TrafficSource {
  // Check URL params for source tracking (e.g., ?source=qr)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get("source");
    if (sourceParam === "qr") return "qr";
    if (sourceParam === "social") return "social";
  }

  if (!referrer || referrer === "direct") {
    return "direct";
  }

  const lowerReferrer = referrer.toLowerCase();

  // Social media platforms
  const socialPlatforms = [
    "facebook.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "instagram.com",
    "tiktok.com",
    "youtube.com",
    "reddit.com",
    "pinterest.com",
    "t.co",
  ];

  if (socialPlatforms.some((p) => lowerReferrer.includes(p))) {
    return "social";
  }

  return "referral";
}

/**
 * Track analytics event
 */
async function trackAnalyticsEvent(
  resumeId: string,
  type: "view" | "download" | "share",
  source?: TrafficSource,
  referrer?: string
): Promise<void> {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeId,
        type,
        source,
        referrer,
      }),
    });
  } catch (error) {
    // Silently fail - analytics should not block UX
    console.error("Failed to track analytics:", error);
  }
}

export function PublicResumeView({
  resume,
  username,
  slug,
}: PublicResumeViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const hasTrackedView = useRef(false);

  const { data, templateId, customization } = resume;
  const { personalInfo } = data;
  const fullName =
    `${personalInfo.firstName} ${personalInfo.lastName}`.trim() ||
    "Public Resume";

  // Track view on mount
  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;

    const referrer = document.referrer || "";
    const source = determineSource(referrer);

    trackAnalyticsEvent(resume.resumeId, "view", source, referrer);
  }, [resume.resumeId]);

  const handleShare = async () => {
    const url = window.location.href;

    // Track share event
    trackAnalyticsEvent(resume.resumeId, "share", "direct");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName}'s Resume`,
          text: personalInfo.summary || `Professional resume of ${fullName}`,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Call the download API
      const response = await fetch(
        `/api/public/${username}/${slug}/download`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Resume downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download resume");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTemplate = () => {
    const templateCustomization = customization as TemplateCustomization;

    switch (templateId) {
      case "modern":
        return (
          <ModernTemplate data={data} customization={templateCustomization} />
        );
      case "classic":
        return (
          <ClassicTemplate data={data} customization={templateCustomization} />
        );
      case "executive":
        return (
          <ExecutiveTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "minimalist":
        return (
          <MinimalistTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "creative":
        return (
          <CreativeTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "technical":
        return (
          <TechnicalTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "adaptive":
        return (
          <AdaptiveTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "timeline":
        return (
          <TimelineTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "ivy":
        return (
          <IvyTemplate data={data} customization={templateCustomization} />
        );
      case "ats-clarity":
        return (
          <ATSClarityTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "ats-structured":
        return (
          <ATSStructuredTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "ats-compact":
        return (
          <ATSCompactTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "cascade":
        return (
          <CascadeTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "dublin":
        return (
          <DublinTemplate data={data} customization={templateCustomization} />
        );
      case "infographic":
        return (
          <InfographicTemplate
            data={data}
            customization={templateCustomization}
          />
        );
      case "cubic":
        return (
          <CubicTemplate data={data} customization={templateCustomization} />
        );
      case "bold":
        return (
          <BoldTemplate data={data} customization={templateCustomization} />
        );
      default:
        return (
          <ModernTemplate data={data} customization={templateCustomization} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">ResumeForge</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="font-semibold text-gray-900">{fullName}</h1>
                {personalInfo.jobTitle && (
                  <p className="text-sm text-gray-500">
                    {personalInfo.jobTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Resume Content */}
      <main className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Resume Preview Container */}
          <div
            className="bg-white shadow-lg mx-auto overflow-hidden"
            style={{
              width: "210mm",
              minHeight: "297mm",
              maxWidth: "100%",
            }}
          >
            {renderTemplate()}
          </div>

          {/* Footer CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">
              Create your own professional resume in minutes
            </p>
            <Link href="/">
              <Button size="lg">
                Build Your Resume Free
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Stats (hidden, for SEO/metrics) */}
      <div className="hidden">
        <span data-views={resume.viewCount} />
        <span data-downloads={resume.downloadCount} />
      </div>
    </div>
  );
}
