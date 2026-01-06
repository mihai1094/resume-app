"use client";

import { useMemo } from "react";
import { TemplateId } from "@/lib/constants/templates";
import { MOCK_RESUME_CONDENSED } from "@/lib/constants/mock-resume";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { cn } from "@/lib/utils";

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
import { SimpleTemplate } from "@/components/resume/templates/simple-template";
import { DiamondTemplate } from "@/components/resume/templates/diamond-template";
import { IconicTemplate } from "@/components/resume/templates/iconic-template";
import { StudentTemplate } from "@/components/resume/templates/student-template";
import { FunctionalTemplate } from "@/components/resume/templates/functional-template";

interface TemplateGalleryPreviewProps {
  templateId: TemplateId;
  primaryColor: string;
  secondaryColor: string;
  /** IDE theme ID for Technical template */
  ideThemeId?: string;
  className?: string;
}

/**
 * Scaled-down preview of actual templates with mock data
 * Used in the template gallery to show realistic template previews
 */
export function TemplateGalleryPreview({
  templateId,
  primaryColor,
  secondaryColor,
  ideThemeId,
  className,
}: TemplateGalleryPreviewProps) {
  // Create customization object with the selected colors
  const customization: TemplateCustomization = useMemo(
    () => ({
      primaryColor,
      secondaryColor,
      accentColor: primaryColor,
      fontFamily: "sans",
      fontSize: 13,
      lineSpacing: 1.5,
      sectionSpacing: 16,
      // Pass IDE theme ID for Technical template
      ideThemeId: templateId === "technical" ? ideThemeId : undefined,
    }),
    [primaryColor, secondaryColor, ideThemeId, templateId]
  );

  // Render the appropriate template with mock data
  const templateContent = useMemo(() => {
    const props = {
      data: MOCK_RESUME_CONDENSED,
      customization,
    };

    switch (templateId) {
      case "modern":
        return <ModernTemplate {...props} />;
      case "classic":
        return <ClassicTemplate {...props} />;
      case "executive":
        return <ExecutiveTemplate {...props} />;
      case "minimalist":
        return <MinimalistTemplate {...props} />;
      case "creative":
        return <CreativeTemplate {...props} />;
      case "technical":
        return <TechnicalTemplate {...props} />;
      case "adaptive":
        return <AdaptiveTemplate {...props} />;
      case "timeline":
        return <TimelineTemplate {...props} />;
      case "ivy":
        return <IvyTemplate {...props} />;
      case "ats-clarity":
        return <ATSClarityTemplate {...props} />;
      case "ats-structured":
        return <ATSStructuredTemplate {...props} />;
      case "ats-compact":
        return <ATSCompactTemplate {...props} />;
      case "cascade":
        return <CascadeTemplate {...props} />;
      case "dublin":
        return <DublinTemplate {...props} />;
      case "infographic":
        return <InfographicTemplate {...props} />;
      case "cubic":
        return <CubicTemplate {...props} />;
      case "bold":
        return <BoldTemplate {...props} />;
      case "simple":
        return <SimpleTemplate {...props} />;
      case "diamond":
        return <DiamondTemplate {...props} />;
      case "iconic":
        return <IconicTemplate {...props} />;
      case "student":
        return <StudentTemplate {...props} />;
      case "functional":
        return <FunctionalTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
    }
  }, [templateId, customization]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Container that will be scaled down */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          // A4 dimensions at 96 DPI (standard screen resolution)
          width: "794px", // 210mm at 96 DPI
          height: "1123px", // 297mm at 96 DPI
          // Scale to fit within the container
          transform: "scale(var(--preview-scale, 0.25))",
        }}
      >
        {/* Force template to fill exact A4 dimensions */}
        <div
          className="bg-white overflow-hidden"
          style={{
            width: "794px",
            height: "1123px",
            minWidth: "794px",
            maxWidth: "794px",
          }}
        >
          {templateContent}
        </div>
      </div>
    </div>
  );
}
