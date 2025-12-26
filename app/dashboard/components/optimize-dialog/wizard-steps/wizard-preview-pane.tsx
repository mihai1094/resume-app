"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye, X, Sparkles } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import {
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  TemplateCustomizationDefaults,
} from "@/lib/constants/defaults";
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { TechnicalTemplate } from "@/components/resume/templates/technical-template";
import { AdaptiveTemplate } from "@/components/resume/templates/adaptive-template";
import { TimelineTemplate } from "@/components/resume/templates/timeline-template";
import { cn } from "@/lib/utils";
import { ChangeRecord } from "@/lib/ai/content-types";

interface WizardPreviewPaneProps {
  resumeData: ResumeData;
  templateId: TemplateId;
  customization?: TemplateCustomizationDefaults;
  recentChanges?: ChangeRecord[];
  className?: string;
}

// Map change sections to highlight areas
const sectionHighlights: Record<string, string> = {
  skills: "Skills",
  experience: "Work Experience",
  summary: "Professional Summary",
  education: "Education",
  projects: "Projects",
};

export function WizardPreviewPane({
  resumeData,
  templateId,
  customization = DEFAULT_TEMPLATE_CUSTOMIZATION,
  recentChanges = [],
  className,
}: WizardPreviewPaneProps) {
  // Get recently changed sections for highlights
  const changedSections = useMemo(() => {
    const sections = new Set<string>();
    recentChanges.slice(-5).forEach((change) => {
      if (change.section) {
        sections.add(change.section);
      }
    });
    return Array.from(sections);
  }, [recentChanges]);

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return <ModernTemplate data={resumeData} customization={customization} />;
      case "classic":
        return <ClassicTemplate data={resumeData} customization={customization} />;
      case "executive":
        return <ExecutiveTemplate data={resumeData} customization={customization} />;
      case "minimalist":
        return <MinimalistTemplate data={resumeData} customization={customization} />;
      case "creative":
        return <CreativeTemplate data={resumeData} customization={customization} />;
      case "technical":
        return <TechnicalTemplate data={resumeData} customization={customization} />;
      case "adaptive":
        return <AdaptiveTemplate data={resumeData} customization={customization} />;
      case "timeline":
        return <TimelineTemplate data={resumeData} customization={customization} />;
      default:
        return <ModernTemplate data={resumeData} customization={customization} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex flex-col h-full", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        {changedSections.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600">
              {changedSections.length} section{changedSections.length !== 1 ? "s" : ""} updated
            </span>
          </div>
        )}
      </div>

      {/* Changed sections badges */}
      {changedSections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b bg-green-50/50 dark:bg-green-950/20">
          {changedSections.map((section) => (
            <Badge
              key={section}
              variant="secondary"
              className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            >
              {sectionHighlights[section] || section}
            </Badge>
          ))}
        </div>
      )}

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="p-4">
          <div
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
            style={{ zoom: 0.35 }}
          >
            <div className="p-8 min-w-[210mm]" style={{ fontFamily: "Inter, sans-serif" }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile floating button + bottom sheet
interface WizardPreviewMobileProps extends WizardPreviewPaneProps {
  changesCount: number;
}

export function WizardPreviewMobile({
  resumeData,
  templateId,
  customization = DEFAULT_TEMPLATE_CUSTOMIZATION,
  recentChanges = [],
  changesCount,
}: WizardPreviewMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="fixed bottom-4 right-4 z-50 shadow-lg gap-2 lg:hidden"
        >
          <Eye className="w-4 h-4" />
          Preview
          {changesCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-green-600">
              {changesCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" />
              Resume Preview
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-auto h-[calc(80vh-4rem)]">
          <WizardPreviewPane
            resumeData={resumeData}
            templateId={templateId}
            customization={customization}
            recentChanges={recentChanges}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
