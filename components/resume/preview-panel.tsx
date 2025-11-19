"use client";

import { Suspense, lazy } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, Loader2 } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { cn } from "@/lib/utils";

// Lazy load templates for better performance
const ModernTemplate = lazy(() =>
  import("./templates/modern-template").then((mod) => ({
    default: mod.ModernTemplate,
  }))
);
const ClassicTemplate = lazy(() =>
  import("./templates/classic-template").then((mod) => ({
    default: mod.ClassicTemplate,
  }))
);
const ExecutiveTemplate = lazy(() =>
  import("./templates/executive-template").then((mod) => ({
    default: mod.ExecutiveTemplate,
  }))
);
const MinimalistTemplate = lazy(() =>
  import("./templates/minimalist-template").then((mod) => ({
    default: mod.MinimalistTemplate,
  }))
);
const CreativeTemplate = lazy(() =>
  import("./templates/creative-template").then((mod) => ({
    default: mod.CreativeTemplate,
  }))
);
const TechnicalTemplate = lazy(() =>
  import("./templates/technical-template").then((mod) => ({
    default: mod.TechnicalTemplate,
  }))
);

const TemplateLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

interface PreviewPanelProps {
  templateId: string;
  resumeData: ResumeData;
  isValid: boolean;
  className?: string;
  customization?: TemplateCustomization;
}

export function PreviewPanel({
  templateId,
  resumeData,
  isValid,
  className,
  customization,
}: PreviewPanelProps) {
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
    <div className={className}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Live Preview</h3>
          </div>
          {isValid && (
            <Badge variant="default" className="bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <Separator className="mb-4" />
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-16rem)]">
            <div className="p-4 min-w-[210mm]" style={{ zoom: 0.4 }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
