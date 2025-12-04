"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Check, Palette } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer"; // This import is no longer needed if TemplateCustomizationDefaults is used
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
// import { TemplateRenderer } from "./template-renderer"; // This import will be removed

// New imports for templates
import { ModernTemplate } from "./templates/modern-template";
import { ClassicTemplate } from "./templates/classic-template";
import { ExecutiveTemplate } from "./templates/executive-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { CreativeTemplate } from "./templates/creative-template";
import { TechnicalTemplate } from "./templates/technical-template";
import { AdaptiveTemplate } from "./templates/adaptive-template";
import { TimelineTemplate } from "./templates/timeline-template";
import { IvyTemplate } from "./templates/ivy-template";
import { ATSClarityTemplate } from "./templates/ats-clarity-template";
import { ATSStructuredTemplate } from "./templates/ats-structured-template";
import { ATSCompactTemplate } from "./templates/ats-compact-template";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults"; // New import for customization defaults

interface PreviewPanelProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  isValid?: boolean; // Changed to optional
  className?: string;
  customization: TemplateCustomizationDefaults; // Changed type
  onToggleCustomizer?: () => void;
  showCustomizer?: boolean;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

export function PreviewPanel({
  templateId,
  resumeData,
  isValid = true, // Added default value
  className,
  customization,
  onToggleCustomizer,
  showCustomizer = false,
  onChangeTemplate,
}: PreviewPanelProps) {
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
      case "ivy":
        return <IvyTemplate data={resumeData} customization={customization} />;
      case "ats-clarity":
        return (
          <ATSClarityTemplate data={resumeData} customization={customization} />
        );
      case "ats-structured":
        return (
          <ATSStructuredTemplate data={resumeData} customization={customization} />
        );
      case "ats-compact":
        return (
          <ATSCompactTemplate data={resumeData} customization={customization} />
        );
      default:
        return <ModernTemplate data={resumeData} customization={customization} />;
    }
  };

  return (
    <div className={className}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Live Preview</h3>
            {onToggleCustomizer && (
              <>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <Button
                  variant={showCustomizer ? "secondary" : "ghost"}
                  size="icon"
                  onClick={onToggleCustomizer}
                  className="h-7 w-7"
                  title={showCustomizer ? "Hide customizer" : "Customize template"}
                >
                  <Palette className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
          {isValid && (
            <Badge variant="default" className="bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <Separator className="mb-4" />
        {/* Template Selector */}
        {onChangeTemplate && (
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Choose Template
            </label>
            <Select value={templateId} onValueChange={onChangeTemplate}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator className="mb-4" />
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-16rem)]">
            <div className="p-4 min-w-[210mm]" style={{ zoom: 0.4 }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
