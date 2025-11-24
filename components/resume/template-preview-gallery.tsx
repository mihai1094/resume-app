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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutGrid,
  Sparkles,
  Monitor,
  ArrowLeftRight,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import {
  templates as TEMPLATE_DATA,
  TemplateId,
} from "@/lib/constants/templates";
import { cn } from "@/lib/utils";

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
  const [previewTemplate, setPreviewTemplate] =
    useState<TemplateId>(activeTemplateId);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      setPreviewTemplate(activeTemplateId);
      setMobilePreviewOpen(false);
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

  const handleMobileSelect = (templateId: TemplateId) => {
    setPreviewTemplate(templateId);
    setMobilePreviewOpen(true);
  };

  const handleMobileApply = () => {
    onSelectTemplate(previewTemplate);
    onOpenChange(false);
  };

  // Desktop Layout Content
  const DesktopContent = (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Compare Templates
        </DialogTitle>
        <DialogDescription>
          See how your resume looks across different layouts before making a
          switch.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] flex-1 min-h-0">
        {/* Template list */}
        <ScrollArea className="h-[calc(80vh-10rem)]">
          <div className="space-y-3 pr-4">
            {TEMPLATE_DATA.map((template) => {
              const isActive = template.id === previewTemplate;
              const isCurrent = template.id === activeTemplateId;

              return (
                <button
                  key={template.id}
                  onClick={() => setPreviewTemplate(template.id)}
                  className={cn(
                    "w-full text-left transition-all rounded-xl border bg-gradient-to-br p-4",
                    isActive
                      ? "border-primary shadow-lg ring-2 ring-primary/30"
                      : "border-border hover:border-primary/60",
                    template.color
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs shrink-0">
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
        </ScrollArea>

        {/* Preview column */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Previewing</p>
                <h3 className="text-lg font-semibold capitalize">
                  {previewTemplateMeta?.name || "Template"}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span>Live Data</span>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg overflow-hidden flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4" style={{ zoom: 0.45 }}>
                  <div className="min-w-[210mm]">
                    <TemplateRenderer
                      templateId={previewTemplate}
                      data={resumeData}
                      customization={customization}
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPreviewTemplate(activeTemplateId)}
              disabled={previewTemplate === activeTemplateId}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Back to current
            </Button>
            <Button
              className="flex-1"
              onClick={handleApplyTemplate}
              disabled={previewTemplate === activeTemplateId}
            >
              Use {previewTemplateMeta?.name || "template"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  // Mobile Layout Content
  const MobileContent = (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div>
          <h2 className="font-semibold text-lg">Choose Template</h2>
          <p className="text-xs text-muted-foreground">
            {TEMPLATE_DATA.length} templates available
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Template Grid */}
      {!mobilePreviewOpen ? (
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-1 gap-3">
            {TEMPLATE_DATA.map((template) => {
              const isCurrent = template.id === activeTemplateId;

              return (
                <button
                  key={template.id}
                  onClick={() => handleMobileSelect(template.id)}
                  className={cn(
                    "w-full text-left transition-all rounded-2xl border-2 bg-gradient-to-br p-4 active:scale-[0.98]",
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-transparent",
                    template.color
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Template Icon/Preview Indicator */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/80 border-border"
                      )}
                    >
                      {isCurrent ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{template.name}</p>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {template.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {template.industry}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
          {/* Bottom padding for safe area */}
          <div className="h-6" />
        </ScrollArea>
      ) : (
        /* Mobile Preview View */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Preview Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobilePreviewOpen(false)}
              className="shrink-0"
            >
              ← Back
            </Button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {previewTemplateMeta?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {previewTemplateMeta?.description}
              </p>
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 bg-muted/30 overflow-auto">
            <div className="p-4 pb-32">
              <div
                className="mx-auto bg-background rounded-lg shadow-xl overflow-hidden"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                <div
                  style={{
                    transform: "scale(0.38)",
                    transformOrigin: "top left",
                    width: "263.16%",
                  }}
                >
                  <TemplateRenderer
                    templateId={previewTemplate}
                    data={resumeData}
                    customization={customization}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t safe-area-inset-bottom">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMobilePreviewOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleMobileApply}
                disabled={previewTemplate === activeTemplateId}
              >
                {previewTemplate === activeTemplateId ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Current Template
                  </>
                ) : (
                  `Use ${previewTemplateMeta?.name}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isMobile
            ? "fixed inset-0 w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none p-0 flex flex-col data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4"
            : "flex max-w-6xl w-full flex-col max-h-[90vh]"
        )}
      >
        {isMobile ? MobileContent : DesktopContent}
      </DialogContent>
    </Dialog>
  );
}
