"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlignJustify, ArrowLeft, Check, ChevronDown, Columns2, Palette, PanelLeft, Pencil, Star, ZoomIn, ZoomOut } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import { TemplateId, TEMPLATES, TemplateStyleCategory, TEMPLATE_STYLE_CATEGORIES } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 0.6;
const ZOOM_STEP = 0.05;
const DEFAULT_ZOOM = 0.45;

interface SectionOption {
  id: string;
  label: string;
}

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
  /** Sections available for the "Jump to section" shortcut. */
  sections?: SectionOption[];
  /** Current section id — used to pre-select in the jump dropdown. */
  activeSectionId?: string;
  /** Called with a section id when the user picks one from the jump dropdown. */
  onJumpToSection?: (sectionId: string) => void;
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
  sections,
  activeSectionId,
  onJumpToSection,
}: MobilePreviewOverlayProps) {
  const canJumpToSection =
    Boolean(onJumpToSection) && Array.isArray(sections) && sections.length > 0;
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
        {/* Template Selector — Drawer bottom sheet for mobile */}
        {onChangeTemplate && !showCustomizer && (
          <div className="px-4 pt-4 pb-2 border-b" data-template-selector>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Choose Template
            </label>
            <TemplateDrawer
              templateId={templateId}
              onChangeTemplate={onChangeTemplate}
            />
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
                  templateId={templateId}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 pb-20">
              <div className="mx-auto w-full max-w-[210mm]">
                <div className="bg-white dark:bg-zinc-100 shadow-lg dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)] dark:ring-1 dark:ring-white/5 origin-top" style={{ zoom }}>
                  {renderedTemplate}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Consistent with Editor */}
      {!showCustomizer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
          <div className="h-14 px-2 flex items-center gap-2">
            {canJumpToSection && (
              <Select
                value={activeSectionId}
                onValueChange={(value) => {
                  onJumpToSection?.(value);
                  onClose();
                }}
              >
                <SelectTrigger
                  className="h-11 w-[42%] rounded-xl border-primary/25 bg-primary/10 text-primary focus:ring-primary/40"
                  aria-label="Jump to section"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Pencil className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Edit section" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {sections!.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button
              onClick={onToggleCustomizer}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-colors border border-primary/25 bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
              aria-label="Customize template"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-semibold">Customize</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS: Record<TemplateStyleCategory, string> = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  "ats-optimized": "ATS-Optimized",
};

const LAYOUT_ICON: Record<string, typeof AlignJustify> = {
  "single-column": AlignJustify,
  "two-column": Columns2,
  sidebar: PanelLeft,
};

const ATS_DOT: Record<string, string> = {
  excellent: "bg-emerald-500",
  good: "bg-blue-500",
  moderate: "bg-amber-500",
  low: "bg-slate-400",
};

function TemplateDrawer({
  templateId,
  onChangeTemplate,
}: {
  templateId: TemplateId;
  onChangeTemplate: (id: TemplateId) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentTemplate = TEMPLATES.find((t) => t.id === templateId);

  const grouped = TEMPLATE_STYLE_CATEGORIES.reduce(
    (acc, cat) => {
      const items = TEMPLATES.filter((t) => t.styleCategory === cat);
      if (items.length > 0) acc.push({ category: cat, templates: items });
      return acc;
    },
    [] as { category: TemplateStyleCategory; templates: typeof TEMPLATES }[]
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="w-full h-10 px-3 flex items-center justify-between rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent/50 transition-colors"
        >
          <span className="truncate">{currentTemplate?.name ?? "Template"}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80svh]">
        <DrawerHeader className="pb-0">
          <DrawerTitle className="text-base">Choose Template</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[65svh] overflow-y-auto overscroll-contain py-1">
          {grouped.map(({ category, templates }, gi) => (
            <div key={category}>
              {gi > 0 && <div className="mx-4 my-1 border-t border-border/40" />}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-4 pt-2.5 pb-1">
                {CATEGORY_LABELS[category]}
              </p>

              {templates.map((t) => {
                const isSelected = t.id === templateId;
                const ats = t.features.atsCompatibility;
                const LayoutIcon = LAYOUT_ICON[t.layout];
                const isPopular = t.popularity >= 93;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onChangeTemplate(t.id as TemplateId);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors group",
                      "active:bg-muted/70",
                      isSelected ? "bg-primary/6" : "hover:bg-muted/50"
                    )}
                  >
                    <span className={cn("w-[7px] h-[7px] rounded-full shrink-0", ATS_DOT[ats])} />

                    <span className="flex-1 min-w-0 flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          "text-sm leading-tight truncate",
                          isSelected ? "font-semibold text-primary" : "font-medium text-foreground"
                        )}
                      >
                        {t.name}
                      </span>

                      {isPopular && !isSelected && (
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0 translate-y-[-0.5px]" />
                      )}
                    </span>

                    {isSelected ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <LayoutIcon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer legend */}
        <div className="border-t border-border/30 px-4 py-2.5 flex items-center gap-3 text-[10px] text-muted-foreground/50">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Excellent</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Good</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />OK</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Low</span>
          <span className="ml-auto">ATS</span>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
