"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Sparkles,
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

  const handleTemplateChange = (templateId: TemplateId) => {
    setPreviewTemplate(templateId);
  };

  const handleApplyMobileTemplate = () => {
    onSelectTemplate(previewTemplate);
    onOpenChange(false);
  };

  // Carousel navigation
  const currentTemplateIndex = TEMPLATE_DATA.findIndex(
    (t) => t.id === previewTemplate
  );

  const goToNextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % TEMPLATE_DATA.length;
    setPreviewTemplate(TEMPLATE_DATA[nextIndex].id);
  };

  const goToPreviousTemplate = () => {
    const prevIndex =
      currentTemplateIndex === 0
        ? TEMPLATE_DATA.length - 1
        : currentTemplateIndex - 1;
    setPreviewTemplate(TEMPLATE_DATA[prevIndex].id);
  };

  const goToTemplate = (index: number) => {
    setPreviewTemplate(TEMPLATE_DATA[index].id);
  };

  // Desktop Layout Content - Carousel
  const DesktopContent = (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Choose Template
        </DialogTitle>
        <DialogDescription>
          Navigate through templates to see how your resume looks in different layouts.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Template Info Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {previewTemplateMeta?.name || "Template"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {previewTemplateMeta?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {previewTemplate === activeTemplateId && (
              <Badge variant="secondary">Current</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              <Sparkles className="w-3 h-3 mr-1" />
              {previewTemplateMeta?.category}
            </Badge>
          </div>
        </div>

        {/* Preview with Navigation */}
        <div className="relative flex-1 bg-muted/30 rounded-lg overflow-hidden">
          {/* Previous Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goToPreviousTemplate}
            className="absolute left-4 top-4 z-10 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Scrollable Template Preview */}
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <div className="flex justify-center py-8 px-20 min-h-full">
              <div style={{ width: "210mm", zoom: 0.45 }}>
                <TemplateRenderer
                  templateId={previewTemplate}
                  data={resumeData}
                  customization={customization}
                />
              </div>
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goToNextTemplate}
            className="absolute right-4 top-4 z-10 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-shrink-0">
          {TEMPLATE_DATA.map((template, index) => (
            <button
              key={template.id}
              onClick={() => goToTemplate(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentTemplateIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              title={template.name}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApplyTemplate}
            disabled={previewTemplate === activeTemplateId}
          >
            {previewTemplate === activeTemplateId ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Current Template
              </>
            ) : (
              `Use ${previewTemplateMeta?.name || "Template"}`
            )}
          </Button>
        </div>
      </div>
    </>
  );

  // Mobile Layout Content - Preview with Dropdown Selector
  const MobileContent = (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>Choose Template</DialogTitle>
        <DialogDescription>
          Browse and select from {TEMPLATE_DATA.length} available templates
        </DialogDescription>
      </DialogHeader>

      {/* Mobile Header with Dropdown */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg">Choose Template</h2>
          <p className="text-xs text-muted-foreground">
            {previewTemplateMeta?.name}
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

      {/* Mobile Template Preview with Dropdown */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Template Dropdown Selector */}
        <div className="p-4 border-b flex-shrink-0">
          <Select value={previewTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_DATA.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/30">
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApplyMobileTemplate}
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
