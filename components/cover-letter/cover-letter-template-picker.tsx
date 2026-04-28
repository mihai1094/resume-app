"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react";
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
  COVER_LETTER_TEMPLATES,
  CoverLetterTemplateId,
} from "@/lib/types/cover-letter";
import { cn } from "@/lib/utils";

interface CoverLetterTemplatePickerProps {
  templateId: CoverLetterTemplateId;
  onChange: (templateId: CoverLetterTemplateId) => void;
  className?: string;
}

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

function TemplateList({
  templateId,
  onSelect,
}: {
  templateId: CoverLetterTemplateId;
  onSelect: (id: CoverLetterTemplateId) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide py-1">
      {COVER_LETTER_TEMPLATES.map((template) => {
        const selected = template.id === templateId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "w-full flex items-start gap-2 px-3 py-2 text-left transition-colors",
              "hover:bg-muted/60",
              selected && "bg-primary/5"
            )}
          >
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  selected ? "text-primary" : "text-foreground"
                )}
              >
                {template.name}
              </p>
              <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                {template.description}
              </p>
            </div>
            {selected && (
              <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CoverLetterTemplatePickerComponent({
  templateId,
  onChange,
  className,
}: CoverLetterTemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const currentIndex = COVER_LETTER_TEMPLATES.findIndex((t) => t.id === templateId);
  const currentTemplate = COVER_LETTER_TEMPLATES[currentIndex];

  const handleSelect = useCallback(
    (id: CoverLetterTemplateId) => {
      onChange(id);
      setOpen(false);
    },
    [onChange]
  );

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevIndex =
        currentIndex <= 0 ? COVER_LETTER_TEMPLATES.length - 1 : currentIndex - 1;
      onChange(COVER_LETTER_TEMPLATES[prevIndex].id);
    },
    [currentIndex, onChange]
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextIndex =
        currentIndex >= COVER_LETTER_TEMPLATES.length - 1 ? 0 : currentIndex + 1;
      onChange(COVER_LETTER_TEMPLATES[nextIndex].id);
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
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className="max-h-[85svh] z-[300]">
            <DrawerHeader className="pb-0">
              <DrawerTitle className="text-base">Choose Template</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[70svh] overflow-y-auto">
              <TemplateList templateId={templateId} onSelect={handleSelect} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[220px] p-0 rounded-xl border-border/40 shadow-xl bg-popover overflow-hidden z-[300]"
          >
            <div className="flex flex-col max-h-[min(70vh,460px)]">
              <TemplateList templateId={templateId} onSelect={handleSelect} />
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

export const CoverLetterTemplatePicker = memo(CoverLetterTemplatePickerComponent);
