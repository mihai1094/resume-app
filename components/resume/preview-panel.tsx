"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Palette, Maximize2, ArrowLeft } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { WheelEvent, useCallback, useEffect, useState } from "react";
import { PagedPreview } from "./paged-preview";
import { TemplateRenderer } from "./template-renderer";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";

interface PreviewPanelProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  isValid?: boolean;
  className?: string;
  customization: TemplateCustomizationDefaults;
  onToggleCustomizer?: () => void;
  showCustomizer?: boolean;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean | ((prev: boolean) => boolean)) => void;
  onChangeTemplate?: (templateId: TemplateId) => void;
  onCustomizationChange?: (updates: Partial<TemplateCustomization>) => void;
  onResetCustomization?: () => void;
}

function PreviewPanelComponent({
  templateId,
  resumeData,
  isValid = true,
  className,
  customization,
  onToggleCustomizer,
  showCustomizer = false,
  isFullscreen,
  setIsFullscreen,
  onChangeTemplate,
  onCustomizationChange,
  onResetCustomization,
}: PreviewPanelProps) {
  const canCustomizeInFullscreen = Boolean(
    customization && onCustomizationChange && onResetCustomization
  );
  const [showFullscreenCustomizer, setShowFullscreenCustomizer] = useState(false);
  const [sideZoom, setSideZoom] = useState(0.48);
  const [controlsSeen, setControlsSeen] = useState(true);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem("editor_preview_controls_seen_v1") === "1";
      setControlsSeen(seen);
    } catch {
      setControlsSeen(false);
    }
  }, []);

  const markControlsSeen = useCallback(() => {
    if (controlsSeen) return;
    setControlsSeen(true);
    try {
      window.localStorage.setItem("editor_preview_controls_seen_v1", "1");
    } catch {
      // non-critical
    }
  }, [controlsSeen]);

  const isEditableTarget = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable);

  useEffect(() => {
    if (!isFullscreen) {
      setShowFullscreenCustomizer(false);
      return;
    }

    setShowFullscreenCustomizer(canCustomizeInFullscreen && showCustomizer);
  }, [canCustomizeInFullscreen, isFullscreen, showCustomizer]);

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
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";

      if (key === "escape" && isFullscreen) {
        event.preventDefault();
        setIsFullscreen(false);
        return;
      }

      if (key !== "f") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      setIsFullscreen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, setIsFullscreen]);

  const renderFloatingControls = () => (
    <div
      className={cn(
        "absolute top-6 inset-x-0 mx-auto w-max z-30 transition-opacity duration-300 pointer-events-auto",
        controlsSeen
          ? "opacity-0 group-hover:opacity-100"
          : "opacity-100 motion-safe:animate-pulse",
        // Touch devices: always visible at reduced opacity
        "[@media(hover:none)]:opacity-70"
      )}
    >
      <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xl border border-border/40 shadow-xl rounded-full px-2 py-1.5">
        {onChangeTemplate && (
          <div className="w-48 border-r border-border/40 pr-2 mr-1">
            <Select value={templateId} onValueChange={(v) => { markControlsSeen(); onChangeTemplate(v); }}>
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
            onClick={() => { markControlsSeen(); onToggleCustomizer(); }}
            className={cn(
              "h-8 rounded-full gap-1.5 px-4 text-xs font-medium transition-colors border",
              showCustomizer
                ? "shadow-inner border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
                : "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
            )}
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
          onClick={() => { markControlsSeen(); setIsFullscreen(true); }}
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
          keySuffix === "fullscreen" && "cursor-pointer",
          scrollClassName
        )}
        onWheel={(event: WheelEvent<HTMLDivElement>) => {
          if (isScrollable) return;
          event.preventDefault();
          window.scrollBy({ top: event.deltaY, behavior: "auto" });
        }}
        onClick={(e) => {
          // In fullscreen, clicking the background (outside resume) exits
          if (keySuffix === "fullscreen" && e.target === e.currentTarget) {
            setIsFullscreen(false);
          }
        }}
      >
        <div
          key={`${templateId}-${keySuffix ?? "default"}`}
          className="relative z-0 bg-white dark:bg-zinc-100 shadow-[0_2px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] dark:ring-1 dark:ring-white/5 transition-all duration-500 shrink-0"
          style={{ zoom, width: "210mm", minHeight: "297mm" }}
        >
          <PagedPreview>
            <TemplateRenderer
              templateId={templateId}
              data={resumeData}
              customization={customization}
            />
          </PagedPreview>
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
        {renderPreviewCanvas(sideZoom, "max-h-[calc(100svh-7rem)]", undefined, false)}
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl p-4 lg:p-8 flex flex-col animate-in fade-in duration-300"
          onClick={(e) => {
            // Click on the background (outside the resume) exits fullscreen
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="flex justify-between items-center gap-4 mb-6 w-full max-w-[1600px] mx-auto px-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full h-10 px-5 shadow-sm border-border/50 bg-card/60 backdrop-blur-md hover:bg-muted/50 transition-colors"
              onClick={() => setIsFullscreen(false)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Button>

            <div className="flex items-center gap-2">
              {onChangeTemplate && (
                <Select value={templateId} onValueChange={onChangeTemplate}>
                  <SelectTrigger className="h-10 w-48 rounded-full border-border/50 bg-card/60 text-xs font-semibold backdrop-blur-md">
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
              )}

              {canCustomizeInFullscreen && (
                <Button
                  variant={showFullscreenCustomizer ? "secondary" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full h-10 px-5 shadow-sm border-border/50 bg-card/60 backdrop-blur-md transition-colors",
                    showFullscreenCustomizer &&
                      "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                  onClick={() =>
                    setShowFullscreenCustomizer((current) => !current)
                  }
                >
                  <Palette className="w-4 h-4" />
                  Customize
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto">
            <div className="flex h-full gap-6">
              <div className="min-w-0 flex-1">
                {renderPreviewCanvas(
                  showFullscreenCustomizer ? 0.66 : 0.85,
                  "h-[calc(100vh-9rem)]",
                  "fullscreen",
                  true
                )}
              </div>

              {showFullscreenCustomizer && canCustomizeInFullscreen && (
                <div className="flex w-[320px] xl:w-[420px] shrink-0 rounded-3xl border border-border/50 bg-card/75 backdrop-blur-md shadow-xl overflow-hidden">
                  <div className="flex h-full flex-col">
                    <div className="border-b border-border/50 px-5 py-4">
                      <p className="text-sm font-semibold">Customize Template</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Update colors and typography while staying in full preview.
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                      <TemplateCustomizer
                        customization={customization}
                        onChange={onCustomizationChange!}
                        onReset={onResetCustomization!}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const PreviewPanel = PreviewPanelComponent;
