"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Columns2, PanelLeft, AlignJustify, Star, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  TEMPLATES,
  TemplateId,
  TemplateStyleCategory,
  TEMPLATE_STYLE_CATEGORIES,
} from "@/lib/constants/templates";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  templateId: TemplateId;
  onChange: (templateId: TemplateId) => void;
  className?: string;
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

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

/** Shared list content used by both Popover and Drawer */
function TemplateList({
  templateId,
  grouped,
  onSelect,
}: {
  templateId: TemplateId;
  grouped: { category: TemplateStyleCategory; templates: typeof TEMPLATES }[];
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide py-1">
        {grouped.map(({ category, templates }, gi) => (
          <div key={category}>
            {gi > 0 && <div className="mx-3 my-1 border-t border-border/40" />}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 pt-2.5 pb-1">
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
                  onClick={() => onSelect(t.id as TemplateId)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 md:py-[7px] text-left transition-colors group",
                    "hover:bg-muted/50 active:bg-muted/70",
                    isSelected && "bg-primary/6"
                  )}
                >
                  <span className={cn("w-[6px] h-[6px] rounded-full shrink-0", ATS_DOT[ats])} />

                  <span className="flex-1 min-w-0 flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "text-sm md:text-[13px] leading-tight truncate",
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
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <LayoutIcon className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer legend */}
      <div className="border-t border-border/30 px-3 py-2 flex items-center gap-2.5 text-[9px] text-muted-foreground/50">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Excellent</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Good</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />OK</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Low</span>
        <span className="ml-auto">ATS</span>
      </div>
    </>
  );
}

function TemplatePickerComponent({
  templateId,
  onChange,
  className,
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const currentTemplate = TEMPLATES.find((t) => t.id === templateId);

  const grouped = TEMPLATE_STYLE_CATEGORIES.reduce(
    (acc, cat) => {
      const items = TEMPLATES.filter((t) => t.styleCategory === cat);
      if (items.length > 0) acc.push({ category: cat, templates: items });
      return acc;
    },
    [] as { category: TemplateStyleCategory; templates: typeof TEMPLATES }[]
  );

  const handleSelect = useCallback(
    (id: TemplateId) => {
      onChange(id);
      setOpen(false);
    },
    [onChange]
  );

  const currentIndex = TEMPLATES.findIndex((t) => t.id === templateId);

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevIndex = currentIndex <= 0 ? TEMPLATES.length - 1 : currentIndex - 1;
      onChange(TEMPLATES[prevIndex].id as TemplateId);
    },
    [currentIndex, onChange]
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextIndex = currentIndex >= TEMPLATES.length - 1 ? 0 : currentIndex + 1;
      onChange(TEMPLATES[nextIndex].id as TemplateId);
    },
    [currentIndex, onChange]
  );

  const triggerButton = (
    <button
      type="button"
      className="inline-flex items-center justify-center w-[7.5rem] text-sm font-semibold text-foreground hover:text-primary transition-colors truncate md:w-[7.5rem]"
    >
      {currentTemplate?.name ?? "Template"}
      <ChevronDown className="w-3 h-3 ml-1 text-muted-foreground/60 md:hidden" />
    </button>
  );

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Previous template"
        className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            {triggerButton}
          </DrawerTrigger>
          <DrawerContent className="max-h-[85svh] z-[300]">
            <DrawerHeader className="pb-0">
              <DrawerTitle className="text-base">Choose Template</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[70svh] overflow-y-auto">
              <TemplateList
                templateId={templateId}
                grouped={grouped}
                onSelect={handleSelect}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {triggerButton}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[220px] p-0 rounded-xl border-border/40 shadow-xl bg-popover overflow-hidden z-[300]"
          >
            <div className="flex flex-col max-h-[min(70vh,460px)]">
              <TemplateList
                templateId={templateId}
                grouped={grouped}
                onSelect={handleSelect}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      <button
        type="button"
        onClick={goToNext}
        aria-label="Next template"
        className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export const TemplatePicker = memo(TemplatePickerComponent);
