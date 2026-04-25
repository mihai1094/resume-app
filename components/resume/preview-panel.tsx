"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Palette,
  Maximize2,
  ArrowLeft,
  X,
  Layers,
} from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { getTemplateColorOptions, ColorPalette } from "@/lib/constants/color-palettes";
import { ColorSwatchSelector } from "@/components/templates/color-swatch-selector";
import { TemplatePicker } from "./template-picker";
import { WheelEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TemplateRenderer } from "./template-renderer";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";
import { getTemplateFontClassNames } from "@/lib/fonts/editor-fonts";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const isNarrowScreen = useMediaQuery("(max-width: 1023px)");
  const [showFullscreenCustomizer, setShowFullscreenCustomizer] = useState(false);
  const [sideZoom, setSideZoom] = useState(0.50);
  const [showExitHint, setShowExitHint] = useState(false);
  const exitHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMoveRef = useRef(0);

  // Template coach mark — shown once to first-time users
  const [showTemplateHint, setShowTemplateHint] = useState(false);
  const templateHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("rz_template_hint_seen")) return;
    // Delay slightly so the editor finishes rendering before the hint appears
    const delay = setTimeout(() => setShowTemplateHint(true), 1800);
    return () => clearTimeout(delay);
  }, []);

  const dismissTemplateHint = useCallback(() => {
    setShowTemplateHint(false);
    if (templateHintTimerRef.current) clearTimeout(templateHintTimerRef.current);
    if (typeof window !== "undefined") localStorage.setItem("rz_template_hint_seen", "1");
  }, []);

  useEffect(() => {
    if (!showTemplateHint) return;
    templateHintTimerRef.current = setTimeout(() => dismissTemplateHint(), 7000);
    return () => {
      if (templateHintTimerRef.current) clearTimeout(templateHintTimerRef.current);
    };
  }, [showTemplateHint, dismissTemplateHint]);


  // Show the floating exit pill when entering fullscreen, auto-hide after 4s
  useEffect(() => {
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    if (!isFullscreen) {
      setShowExitHint(false);
      return;
    }
    setShowExitHint(true);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 4000);
    return () => {
      if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    };
  }, [isFullscreen]);

  // Re-show the pill briefly on mouse movement (throttled to 500ms)
  const handleFullscreenMouseMove = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveRef.current < 500) return;
    lastMoveRef.current = now;
    setShowExitHint(true);
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 2000);
  }, []);

  const isEditableTarget = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable);

  const prevFullscreenRef = useRef(false);
  useEffect(() => {
    if (!isFullscreen) {
      setShowFullscreenCustomizer(false);
    } else if (!prevFullscreenRef.current) {
      // Only sync parent showCustomizer when ENTERING fullscreen
      setShowFullscreenCustomizer(canCustomizeInFullscreen && showCustomizer);
    }
    prevFullscreenRef.current = isFullscreen;
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
      const key = typeof event.key === "string" ? event.key : "";

      if (key === "Escape" && isFullscreen) {
        event.preventDefault();
        setIsFullscreen(false);
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      if (key.toLowerCase() === "f") {
        event.preventDefault();
        setIsFullscreen((prev) => !prev);
        return;
      }

      // Left/Right arrows cycle templates
      if (onChangeTemplate && (key === "ArrowLeft" || key === "ArrowRight")) {
        event.preventDefault();
        const currentIndex = TEMPLATES.findIndex((t) => t.id === templateId);
        const nextIndex =
          key === "ArrowLeft"
            ? (currentIndex <= 0 ? TEMPLATES.length - 1 : currentIndex - 1)
            : (currentIndex >= TEMPLATES.length - 1 ? 0 : currentIndex + 1);
        onChangeTemplate(TEMPLATES[nextIndex].id as TemplateId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, setIsFullscreen, templateId, onChangeTemplate]);

  // ── Controls bar (above preview, not overlaid) ───────────────────
  const renderSideControls = () => {
    const colorOptions = getTemplateColorOptions(templateId);
    const selectedColor = colorOptions.find((c) => c.primary === customization?.primaryColor) ?? colorOptions[0];

    return (
      <div className="flex items-center gap-2 mb-2 px-1">
        {/* Template name — plain text select, no chrome */}
        <div className="shrink-0 relative">
          {onChangeTemplate ? (
            <>
              {/* Pulsing ring coach mark */}
              {showTemplateHint && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1.5 rounded-lg ring-2 ring-primary/60 animate-pulse"
                />
              )}
              <TemplatePicker
                templateId={templateId}
                onChange={(val) => {
                  dismissTemplateHint();
                  onChangeTemplate(val);
                }}
              />

              {/* Floating callout tooltip */}
              {showTemplateHint && (
                <div
                  role="tooltip"
                  className="absolute left-0 top-full mt-2.5 z-50 w-56 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  {/* Arrow */}
                  <div className="absolute -top-1.5 left-3 w-3 h-3 rotate-45 rounded-sm bg-popover border-l border-t border-border/40 shadow-sm" />
                  <div className="relative bg-popover border border-border/40 rounded-xl shadow-lg px-3.5 py-3">
                    <button
                      type="button"
                      onClick={dismissTemplateHint}
                      aria-label="Dismiss hint"
                      className="absolute top-2 right-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-start gap-2.5 pr-4">
                      <div className="mt-0.5 flex-shrink-0 rounded-md bg-primary/10 p-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">Switch templates</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Click the template name above to try any of {TEMPLATES.length} designs — changes apply instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {TEMPLATES.find((t) => t.id === templateId)?.name}
            </span>
          )}
        </div>

        {/* Color swatches — only when customization is wired up */}
        {onCustomizationChange && (
          <ColorSwatchSelector
            palettes={colorOptions}
            selected={selectedColor}
            onChange={(color: ColorPalette) =>
              onCustomizationChange({ primaryColor: color.primary, secondaryColor: color.secondary })
            }
            size="sm"
            className="flex-1 justify-center"
          />
        )}

        {/* Actions — minimal icon buttons */}
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          {onToggleCustomizer && (
            <button
              type="button"
              onClick={onToggleCustomizer}
              aria-label="Customize template"
              title="Customize template"
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
                showCustomizer
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground bg-muted/40 hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Palette className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Fullscreen preview"
            className="inline-flex items-center justify-center h-8 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // ── Shared preview canvas ────────────────────────────────────────
  const renderPreviewCanvas = (
    zoom: number,
    scrollClassName: string,
    keySuffix?: string,
    isScrollable = true
  ) => {
    const isSide = keySuffix !== "fullscreen";

    return (
      <div className="w-full">
        {isSide && renderSideControls()}
        <div className="bg-muted rounded-2xl border border-border/20 shadow-md overflow-hidden relative group w-full">
        <div
          className={cn(
            "w-full flex flex-col items-center pt-6 pb-3 px-4 scrollbar-hide",
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
            if (keySuffix === "fullscreen" && e.target === e.currentTarget) {
              setIsFullscreen(false);
            }
          }}
        >
          <div className="mx-auto w-full max-w-[210mm]">
            <div
              key={`${templateId}-${keySuffix ?? "default"}`}
              className="bg-white dark:bg-zinc-100 shadow-[0_2px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] dark:ring-1 dark:ring-white/5 origin-top transition-all duration-500"
              style={{ zoom }}
            >
              <TemplateRenderer
                templateId={templateId}
                data={resumeData}
                customization={customization}
              />
            </div>
          </div>
        </div>

        {/* "Complete" badge — side panel, single-page only */}
        {isValid && isSide && (
          <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm backdrop-blur-md px-3 py-1 text-xs">
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Complete
            </Badge>
          </div>
        )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full">
        {renderPreviewCanvas(sideZoom, "max-h-[calc(100svh-8rem)]", undefined, true)}
      </div>

      {isFullscreen && createPortal(
        <div
          className={cn(
            "fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl p-4 lg:p-8 flex flex-col animate-in fade-in duration-300",
            // Portal escapes the editor layout wrapper that supplies `--font-*`
            // CSS variables for next/font, so re-apply them here. Without this,
            // fontFamily changes in the customizer have no visible effect.
            getTemplateFontClassNames()
          )}
          onMouseMove={handleFullscreenMouseMove}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="grid grid-cols-3 items-center gap-4 mb-6 w-full max-w-[1600px] mx-auto px-4">
            {/* Left: Back */}
            <div className="flex justify-start">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg shadow-sm"
                onClick={() => setIsFullscreen(false)}
                title="Back to Editor (Esc)"
                aria-label="Back to Editor"
              >
                <ArrowLeft className="w-4 h-4 text-foreground/80" />
              </Button>
            </div>

            {/* Center: Template picker + color swatches */}
            <div className="flex items-center justify-center gap-3">
              {onChangeTemplate && (
                <TemplatePicker
                  templateId={templateId}
                  onChange={onChangeTemplate}
                />
              )}
              {onCustomizationChange && (
                <ColorSwatchSelector
                  palettes={getTemplateColorOptions(templateId)}
                  selected={getTemplateColorOptions(templateId).find((c) => c.primary === customization?.primaryColor) ?? getTemplateColorOptions(templateId)[0]}
                  onChange={(color: ColorPalette) =>
                    onCustomizationChange({ primaryColor: color.primary, secondaryColor: color.secondary })
                  }
                  size="sm"
                />
              )}
            </div>

            {/* Right: Customize */}
            <div className="flex justify-end">
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

              {showFullscreenCustomizer && canCustomizeInFullscreen && !isNarrowScreen && (
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
                        templateId={templateId}
                      />
                    </div>
                  </div>
                </div>
              )}

              {showFullscreenCustomizer && canCustomizeInFullscreen && isNarrowScreen && (
                <Drawer
                  open={showFullscreenCustomizer}
                  onOpenChange={setShowFullscreenCustomizer}
                >
                  <DrawerContent className="max-h-[85svh] z-[300]">
                    <DrawerHeader>
                      <DrawerTitle>Customize Template</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto px-5 pb-6">
                      <TemplateCustomizer
                        customization={customization}
                        onChange={onCustomizationChange!}
                        onReset={onResetCustomization!}
                        templateId={templateId}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            </div>
          </div>

          {/* Floating exit pill — bottom-center, auto-hides, reappears on mouse move */}
          <div
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[201] pointer-events-none",
              "transition-all duration-500",
              showExitHint
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-3"
            )}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-5 py-2.5",
                "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg",
                "text-sm font-medium text-foreground",
                "hover:bg-muted/60 transition-colors"
              )}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Back to editing
              <kbd className="inline-flex items-center rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                Esc
              </kbd>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export const PreviewPanel = memo(PreviewPanelComponent);
