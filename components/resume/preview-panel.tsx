"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Check, Palette, Maximize2, Minimize2 } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer"; // This import is no longer needed if TemplateCustomizationDefaults is used
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
// import { TemplateRenderer } from "./template-renderer"; // This import will be removed

// New imports for templates
import { ModernTemplate } from "./templates/modern-template";
import { ClassicTemplate } from "./templates/classic-template";
import { ExecutiveTemplate } from "./templates/executive-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { CreativeTemplate } from "./templates/creative-template";
import { TechnicalTemplate } from "./templates/technical-template";
import { AdaptiveTemplate } from "./templates/adaptive-template";
import { TimelineTemplate } from "./templates/timeline-template";
import { IvyTemplate } from "./templates/ivy-template";
import { ATSClarityTemplate } from "./templates/ats-clarity-template";
import { ATSStructuredTemplate } from "./templates/ats-structured-template";
import { ATSCompactTemplate } from "./templates/ats-compact-template";
import { CascadeTemplate } from "./templates/cascade-template";
import { DublinTemplate } from "./templates/dublin-template";
import { InfographicTemplate } from "./templates/infographic-template";
import { CubicTemplate } from "./templates/cubic-template";
import { BoldTemplate } from "./templates/bold-template";
import { SimpleTemplate } from "./templates/simple-template";
import { DiamondTemplate } from "./templates/diamond-template";
import { IconicTemplate } from "./templates/iconic-template";
import { StudentTemplate } from "./templates/student-template";
import { FunctionalTemplate } from "./templates/functional-template";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults"; // New import for customization defaults
import { CSSProperties, WheelEvent, useEffect, useState } from "react";
import { PagedPreview } from "./paged-preview";

interface PreviewPanelProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  isValid?: boolean; // Changed to optional
  className?: string;
  customization: TemplateCustomizationDefaults; // Changed type
  onToggleCustomizer?: () => void;
  showCustomizer?: boolean;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

function PreviewPanelComponent({
  templateId,
  resumeData,
  isValid = true, // Added default value
  className,
  customization,
  onToggleCustomizer,
  showCustomizer = false,
  onChangeTemplate,
}: PreviewPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isEditableTarget = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;

      if (event.key === "Escape" && isFullscreen) {
        event.preventDefault();
        setIsFullscreen(false);
        return;
      }

      if (event.key.toLowerCase() !== "f") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      setIsFullscreen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    }
    if (customization?.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    }
    if (customization?.fontFamily === "sans") {
      return "'Inter', 'Helvetica Neue', Arial, sans-serif";
    }
    if (customization?.fontFamily) {
      return customization.fontFamily;
    }
    return "'Inter', 'Helvetica Neue', Arial, sans-serif";
  };

  const basePreviewStyle: CSSProperties = {
    fontFamily: getFontFamily(),
    fontSize: `${customization.fontSize}px`,
    lineHeight: customization.lineSpacing,
    ["--section-spacing" as string]: `${customization.sectionSpacing}px`,
  };

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return (
          <ModernTemplate data={resumeData} customization={customization} />
        );
      case "classic":
        return (
          <ClassicTemplate data={resumeData} customization={customization} />
        );
      case "executive":
        return (
          <ExecutiveTemplate data={resumeData} customization={customization} />
        );
      case "minimalist":
        return (
          <MinimalistTemplate data={resumeData} customization={customization} />
        );
      case "creative":
        return (
          <CreativeTemplate data={resumeData} customization={customization} />
        );
      case "technical":
        return (
          <TechnicalTemplate data={resumeData} customization={customization} />
        );
      case "adaptive":
        return (
          <AdaptiveTemplate data={resumeData} customization={customization} />
        );
      case "timeline":
        return (
          <TimelineTemplate data={resumeData} customization={customization} />
        );
      case "ivy":
        return <IvyTemplate data={resumeData} customization={customization} />;
      case "ats-clarity":
        return (
          <ATSClarityTemplate data={resumeData} customization={customization} />
        );
      case "ats-structured":
        return (
          <ATSStructuredTemplate
            data={resumeData}
            customization={customization}
          />
        );
      case "ats-compact":
        return (
          <ATSCompactTemplate data={resumeData} customization={customization} />
        );
      case "cascade":
        return (
          <CascadeTemplate data={resumeData} customization={customization} />
        );
      case "dublin":
        return (
          <DublinTemplate data={resumeData} customization={customization} />
        );
      case "infographic":
        return (
          <InfographicTemplate data={resumeData} customization={customization} />
        );
      case "cubic":
        return (
          <CubicTemplate data={resumeData} customization={customization} />
        );
      case "bold":
        return (
          <BoldTemplate data={resumeData} customization={customization} />
        );
      case "simple":
        return (
          <SimpleTemplate data={resumeData} customization={customization} />
        );
      case "diamond":
        return (
          <DiamondTemplate data={resumeData} customization={customization} />
        );
      case "iconic":
        return (
          <IconicTemplate data={resumeData} customization={customization} />
        );
      case "student":
        return (
          <StudentTemplate data={resumeData} customization={customization} />
        );
      case "functional":
        return (
          <FunctionalTemplate data={resumeData} customization={customization} />
        );
      default:
        return (
          <ModernTemplate data={resumeData} customization={customization} />
        );
    }
  };

  const renderFloatingControls = () => (
    <div className="absolute top-6 inset-x-0 mx-auto w-max z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
      <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xl border border-border/40 shadow-xl rounded-full px-2 py-1.5">
        {onChangeTemplate && (
          <div className="w-48 border-r border-border/40 pr-2 mr-1">
            <Select value={templateId} onValueChange={onChangeTemplate}>
              <SelectTrigger className="h-8 border-0 bg-transparent shadow-none focus:ring-0 text-xs font-semibold focus:outline-none focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-lg backdrop-blur-xl bg-background/95">
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id} className="text-xs">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {onToggleCustomizer && (
          <Button
            variant={showCustomizer ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleCustomizer}
            className={cn("h-8 rounded-full gap-1.5 px-4 text-xs font-medium transition-colors", showCustomizer ? "shadow-inner" : "hover:bg-muted/80")}
          >
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xl:inline">Customize</span>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted/80"
          onClick={() => setIsFullscreen(true)}
          title="Fullscreen preview"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  const renderPreviewCanvas = (
    zoom: number,
    scrollClassName: string,
    keySuffix?: string,
    isScrollable = true
  ) => (
    <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-border/20 shadow-md overflow-hidden relative group w-full">
      {/* Floating Toolbar inside canvas context */}
      {keySuffix !== "fullscreen" && renderFloatingControls()}

      <div
        className={cn(
          "w-full flex justify-center py-6 px-4 scrollbar-hide",
          isScrollable ? "overflow-y-auto" : "overflow-y-hidden",
          scrollClassName
        )}
        onWheel={(event: WheelEvent<HTMLDivElement>) => {
          if (isScrollable) return;
          event.preventDefault();
          window.scrollBy({ top: event.deltaY, behavior: "auto" });
        }}
      >
        <div
          key={`${templateId}-${keySuffix ?? "default"}`}
          className="bg-white dark:bg-zinc-100 shadow-[0_2px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-500 shrink-0"
          style={{ zoom, ...basePreviewStyle, width: "210mm", minHeight: "297mm" }}
        >
          <PagedPreview>{renderTemplate()}</PagedPreview>
        </div>
      </div>

      {isValid && keySuffix !== "fullscreen" && (
        <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm backdrop-blur-md px-3 py-1 text-xs">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Complete
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full">
        {renderPreviewCanvas(0.48, "max-h-[calc(100svh-7rem)]", undefined, false)}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl p-4 lg:p-8 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full px-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg tracking-tight">
                Presentation Mode
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full h-10 px-6 shadow-sm border-border/50 bg-card/60 backdrop-blur-md hover:bg-muted/50 transition-colors"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </Button>
          </div>

          <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto">
            {renderPreviewCanvas(0.85, "h-[calc(100vh-9rem)]", "fullscreen", true)}
          </div>
        </div>
      )}
    </div>
  );
}

export const PreviewPanel = PreviewPanelComponent;
