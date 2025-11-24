"use client";

import { Suspense, lazy, type ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateId } from "@/lib/constants/templates";

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
const AdaptiveTemplate = lazy(() =>
  import("./templates/adaptive-template").then((mod) => ({
    default: mod.AdaptiveTemplate,
  }))
);
const TimelineTemplate = lazy(() =>
  import("./templates/timeline-template").then((mod) => ({
    default: mod.TimelineTemplate,
  }))
);
const IvyTemplate = lazy(() =>
  import("./templates/ivy-template").then((mod) => ({
    default: mod.IvyTemplate,
  }))
);

const templateComponents: Record<TemplateId, ComponentType<any>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  executive: ExecutiveTemplate,
  minimalist: MinimalistTemplate,
  creative: CreativeTemplate,
  technical: TechnicalTemplate,
  adaptive: AdaptiveTemplate,
  timeline: TimelineTemplate,
  ivy: IvyTemplate,
};

export const TemplateRendererFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

interface TemplateRendererProps {
  templateId: TemplateId;
  data: ResumeData;
  customization?: TemplateCustomization;
  className?: string;
}

export function TemplateRenderer({
  templateId,
  data,
  customization,
  className,
}: TemplateRendererProps) {
  const TemplateComponent =
    templateComponents[templateId as TemplateId] || templateComponents.modern;

  return (
    <div className={className}>
      <Suspense fallback={<TemplateRendererFallback />}>
        <TemplateComponent data={data} customization={customization} />
      </Suspense>
    </div>
  );
}
