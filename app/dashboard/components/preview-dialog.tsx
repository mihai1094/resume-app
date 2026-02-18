"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar, ZoomIn, ZoomOut, Edit } from "lucide-react";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { DEFAULT_TEMPLATE_CUSTOMIZATION, TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { format } from "date-fns";
import { useState } from "react";

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

export function PreviewDialog({
  resume,
  onClose,
  onEdit,
  customization = DEFAULT_TEMPLATE_CUSTOMIZATION
}: PreviewDialogProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))));

  if (!resume) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
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

        {/* Footer with Close Button */}
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
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
