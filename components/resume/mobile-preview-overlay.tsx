"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { useEffect, useMemo, useRef } from "react";

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
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
        </div>
        {/* Template Selector */}
        {onChangeTemplate && (
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

        <div className="flex-1 overflow-auto">
          {showCustomizer && customization && onCustomizationChange && onResetCustomization ? (
            <div className="p-4 pb-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Customize Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCustomizer}
                  className="gap-2"
                >
                  Done
                </Button>
              </div>
              <TemplateCustomizer
                customization={customization}
                onChange={onCustomizationChange}
                onReset={onResetCustomization}
              />
            </div>
          ) : (
            <div className="p-4 pb-20">
              <div className="min-w-[210mm]" style={{ zoom: 0.35 }}>
                {renderedTemplate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Consistent with Editor */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
        <div className="grid grid-cols-2 h-14 px-2 gap-2 items-center">
          {/* Customize Toggle */}
          <button
            onClick={onToggleCustomizer}
            className={cn(
              "flex items-center justify-center gap-1.5 h-11 rounded-xl transition-colors",
              showCustomizer
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
            aria-pressed={showCustomizer}
            aria-label={showCustomizer ? "Hide customizer" : "Customize template"}
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Customize</span>
          </button>

          {/* Hide Preview Button - Primary Action */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors"
            aria-label="Hide preview and return to form"
          >
            <FileText className="w-4 h-4" />
            <span>Hide Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
