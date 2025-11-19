"use client";

import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Loader2 } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";

// Lazy load templates for better performance
const ModernTemplate = lazy(() =>
  import("./templates/modern-template").then((mod) => ({ default: mod.ModernTemplate }))
);
const ClassicTemplate = lazy(() =>
  import("./templates/classic-template").then((mod) => ({ default: mod.ClassicTemplate }))
);
const ExecutiveTemplate = lazy(() =>
  import("./templates/executive-template").then((mod) => ({ default: mod.ExecutiveTemplate }))
);
const MinimalistTemplate = lazy(() =>
  import("./templates/minimalist-template").then((mod) => ({ default: mod.MinimalistTemplate }))
);
const CreativeTemplate = lazy(() =>
  import("./templates/creative-template").then((mod) => ({ default: mod.CreativeTemplate }))
);
const TechnicalTemplate = lazy(() =>
  import("./templates/technical-template").then((mod) => ({ default: mod.TechnicalTemplate }))
);

const TemplateLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

interface MobilePreviewOverlayProps {
  templateId: string;
  resumeData: ResumeData;
  onClose: () => void;
  customization?: TemplateCustomization;
}

export function MobilePreviewOverlay({
  templateId,
  resumeData,
  onClose,
  customization,
}: MobilePreviewOverlayProps) {
  const renderTemplate = () => {
    const templateProps = { data: resumeData, customization };

    switch (templateId) {
      case "classic":
        return (
          <Suspense fallback={<TemplateLoader />}>
            <ClassicTemplate {...templateProps} />
          </Suspense>
        );
      case "executive":
        return (
          <Suspense fallback={<TemplateLoader />}>
            <ExecutiveTemplate {...templateProps} />
          </Suspense>
        );
      case "minimalist":
        return (
          <Suspense fallback={<TemplateLoader />}>
            <MinimalistTemplate {...templateProps} />
          </Suspense>
        );
      case "creative":
        return (
          <Suspense fallback={<TemplateLoader />}>
            <CreativeTemplate {...templateProps} />
          </Suspense>
        );
      case "technical":
        return (
          <Suspense fallback={<TemplateLoader />}>
            <TechnicalTemplate {...templateProps} />
          </Suspense>
        );
      case "modern":
      default:
        return (
          <Suspense fallback={<TemplateLoader />}>
            <ModernTemplate {...templateProps} />
          </Suspense>
        );
    }
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[210mm]" style={{ zoom: 0.35 }}>
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* Floating "Show Form" Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={onClose}
          className="rounded-full shadow-lg"
        >
          <FileText className="w-5 h-5 mr-2" />
          Show Form
        </Button>
      </div>
    </div>
  );
}

