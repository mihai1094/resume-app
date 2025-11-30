"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar } from "lucide-react";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { format } from "date-fns";

interface PreviewDialogProps {
  resume: {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
    updatedAt: Date | string;
  } | null;
  onClose: () => void;
}

export function PreviewDialog({ resume, onClose }: PreviewDialogProps) {
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
        <div className="flex-1 overflow-auto p-4 bg-muted/30">
          <div className="flex justify-center">
            <div
              className="w-[210mm] bg-white shadow-lg"
              style={{ zoom: 0.6, transformOrigin: "top center" }}
            >
              <TemplateRenderer
                templateId={resume.templateId as TemplateId}
                data={resume.data}
                customization={DEFAULT_TEMPLATE_CUSTOMIZATION}
              />
            </div>
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            onClick={onClose}
            className="rounded-full shadow-lg"
          >
            <X className="w-5 h-5 mr-2" />
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
