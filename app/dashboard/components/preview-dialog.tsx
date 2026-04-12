"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar, ZoomIn, ZoomOut, Edit, ArrowLeft } from "lucide-react";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { DEFAULT_TEMPLATE_CUSTOMIZATION, TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PreviewDialogProps {
  resume: {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
    updatedAt: Date | string;
  } | null;
  onClose: () => void;
  onEdit?: () => void;
  customization?: TemplateCustomizationDefaults;
}

const DEFAULT_ZOOM = 1;

export function PreviewDialog({
  resume,
  onClose,
  onEdit,
  customization = DEFAULT_TEMPLATE_CUSTOMIZATION,
}: PreviewDialogProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [showExitHint, setShowExitHint] = useState(false);
  const exitHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMoveRef = useRef(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))));
  const handleZoomReset = () => setZoom(DEFAULT_ZOOM);

  // Escape key + show hint on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    if (resume) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [resume, onClose]);

  // Show exit pill on open, auto-hide after 4s
  useEffect(() => {
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    if (!resume) {
      setShowExitHint(false);
      return;
    }
    setShowExitHint(true);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 4000);
    return () => {
      if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    };
  }, [resume]);

  // Re-show the pill on mouse movement (throttled to 500ms)
  const handleMouseMove = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveRef.current < 500) return;
    lastMoveRef.current = now;
    setShowExitHint(true);
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 2000);
  }, []);

  if (!resume) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background"
      onMouseMove={handleMouseMove}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{resume.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize text-xs">
                  {resume.templateId}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto px-2 py-3 pb-24 sm:p-4 bg-muted/30">
          <div className="mx-auto w-full max-w-[210mm]">
            <div className="bg-white shadow-lg origin-top" style={{ zoom }}>
              <TemplateRenderer
                templateId={resume.templateId as TemplateId}
                data={resume.data}
                customization={customization}
              />
            </div>
          </div>
        </div>

        {/* Floating exit pill — bottom-center, auto-hides, reappears on mouse move */}
        <div
          className={cn(
            "fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-60 pointer-events-none",
            "transition-all duration-500",
            showExitHint
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3"
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-5 py-2.5",
              "bg-background/90 backdrop-blur-xl border border-border/50 shadow-lg",
              "text-sm font-medium text-foreground",
              "hover:bg-muted/60 transition-colors"
            )}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to dashboard
            <kbd className="inline-flex items-center rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Esc
            </kbd>
          </button>
        </div>

        {/* Footer controls */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              aria-label="Zoom out"
              className="h-11 w-11 rounded-full bg-background shadow-lg"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            {/* Zoom percentage — click to reset */}
            <Button
              variant="outline"
              onClick={handleZoomReset}
              disabled={zoom === DEFAULT_ZOOM}
              aria-label="Reset zoom to 100%"
              title="Reset zoom"
              className="h-11 min-w-[3.5rem] rounded-full bg-background shadow-lg px-3 text-xs font-mono tabular-nums"
            >
              {Math.round(zoom * 100)}%
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 1.4}
              aria-label="Zoom in"
              className="h-11 w-11 rounded-full bg-background shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            {onEdit && (
              <Button
                variant="outline"
                size="lg"
                onClick={onEdit}
                className="rounded-full shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}

            <Button
              size="lg"
              onClick={onClose}
              className="w-full rounded-full shadow-lg sm:w-auto"
            >
              <X className="w-5 h-5 mr-2" />
              Close Preview
              <kbd className="ml-2 hidden sm:inline-flex items-center rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-mono">
                Esc
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
