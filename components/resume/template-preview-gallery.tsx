"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  LayoutGrid,
  Sparkles,
  Monitor,
  ArrowLeftRight,
} from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import {
  templates as TEMPLATE_DATA,
  TemplateId,
} from "@/lib/constants/templates";

interface TemplatePreviewGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  customization?: TemplateCustomization;
  activeTemplateId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export function TemplatePreviewGallery({
  open,
  onOpenChange,
  resumeData,
  customization,
  activeTemplateId,
  onSelectTemplate,
}: TemplatePreviewGalleryProps) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId>(activeTemplateId);

  useEffect(() => {
    if (open) {
      setPreviewTemplate(activeTemplateId);
    }
  }, [open, activeTemplateId]);

  const previewTemplateMeta = useMemo(
    () => TEMPLATE_DATA.find((tpl) => tpl.id === previewTemplate),
    [previewTemplate]
  );

  const handleApplyTemplate = () => {
    onSelectTemplate(previewTemplate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Compare Templates
          </DialogTitle>
          <DialogDescription>
            See how your resume looks across different layouts before making a switch.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Template list */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {TEMPLATE_DATA.map((template) => {
              const isActive = template.id === previewTemplate;
              const isCurrent = template.id === activeTemplateId;

              return (
                <button
                  key={template.id}
                  onClick={() => setPreviewTemplate(template.id)}
                  className={`w-full text-left transition-all rounded-xl border bg-gradient-to-br p-4 ${
                    isActive ? "border-primary shadow-lg ring-2 ring-primary/30" : "border-border hover:border-primary/60"
                  } ${template.color}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        In Use
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="capitalize">{template.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview column */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Previewing</p>
                  <h3 className="text-lg font-semibold capitalize">
                    {previewTemplateMeta?.name || "Template"}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-[calc(80vh-8rem)]">
                  <div className="p-4 min-w-[210mm]" style={{ zoom: 0.45 }}>
                    <TemplateRenderer
                      templateId={previewTemplate}
                      data={resumeData}
                      customization={customization}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setPreviewTemplate(activeTemplateId)}
                disabled={previewTemplate === activeTemplateId}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Back to current
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={handleApplyTemplate}
                disabled={previewTemplate === activeTemplateId}
              >
                Use {previewTemplateMeta?.name || "template"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
