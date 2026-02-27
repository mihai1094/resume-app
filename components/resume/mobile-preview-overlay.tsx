"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Palette, ZoomIn, ZoomOut } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { useEffect, useMemo, useRef, useState } from "react";
import { PagedPreview } from "./paged-preview";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 0.6;
const ZOOM_STEP = 0.05;
const DEFAULT_ZOOM = 0.45;

interface MobilePreviewOverlayProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  onClose: () => void;
  customization?: TemplateCustomizationDefaults;
  onToggleCustomizer?: () => void;
  showCustomizer?: boolean;
  onCustomizationChange?: (updates: Partial<TemplateCustomization>) => void;
  onResetCustomization?: () => void;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

export function MobilePreviewOverlay({
  templateId,
  resumeData,
  onClose,
  customization,
  onToggleCustomizer,
  showCustomizer = false,
  onCustomizationChange,
  onResetCustomization,
  onChangeTemplate,
}: MobilePreviewOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose]);

  const renderedTemplate = useMemo(
    () => (
      <TemplateRenderer
        templateId={templateId}
        data={resumeData}
        customization={customization}
      />
    ),
    [templateId, resumeData, customization]
  );

  return (
    <div
      className="lg:hidden fixed inset-0 z-50 bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile resume preview"
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-20 px-4 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 shrink-0 z-10">
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                className={
                  showCustomizer
                    ? "h-9 w-9 rounded-full shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    : "h-9 w-9 rounded-full shrink-0"
                }
                onClick={showCustomizer ? onToggleCustomizer : onClose}
                aria-label={showCustomizer ? "Back to preview" : "Back to editor"}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-20">
              <h3 className="font-semibold text-base text-center truncate">
                {showCustomizer ? "Customize Template" : "Live Preview"}
              </h3>
            </div>

            {!showCustomizer ? (
              <div className="flex items-center gap-0.5 shrink-0 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="h-9 w-9 rounded-full"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium w-10 text-center text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="h-9 w-9 rounded-full"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="h-9 w-9 shrink-0" aria-hidden="true" />
            )}
          </div>
        </div>
        {/* Template Selector */}
        {onChangeTemplate && !showCustomizer && (
          <div className="px-4 pt-4 pb-2 border-b" data-template-selector>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Choose Template
            </label>
            <Select value={templateId} onValueChange={onChangeTemplate}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 overflow-auto relative">
          {showCustomizer && customization && onCustomizationChange && onResetCustomization ? (
            <div className="pb-24">
              <div className="px-4 pt-4">
                <TemplateCustomizer
                  customization={customization}
                  onChange={onCustomizationChange}
                  onReset={onResetCustomization}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 pb-20">
              <div className="min-w-[210mm] origin-top-left transition-transform" style={{ zoom }}>
                <PagedPreview>
                  {renderedTemplate}
                </PagedPreview>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Consistent with Editor */}
      {!showCustomizer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
          <div className="h-14 px-2 flex items-center">
            <button
              onClick={onToggleCustomizer}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl transition-colors border border-primary/25 bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
              aria-label="Customize template"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-semibold">Customize Template</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
