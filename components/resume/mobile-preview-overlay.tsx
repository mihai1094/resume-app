"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Palette } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization, TemplateCustomizer } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";

interface MobilePreviewOverlayProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  onClose: () => void;
  customization?: TemplateCustomizationDefaults;
  onToggleCustomizer?: () => void;
  showCustomizer?: boolean;
  onCustomizationChange?: (updates: Partial<TemplateCustomization>) => void;
  onResetCustomization?: () => void;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

export function MobilePreviewOverlay({
  templateId,
  resumeData,
  onClose,
  customization,
  onToggleCustomizer,
  showCustomizer = false,
  onCustomizationChange,
  onResetCustomization,
  onChangeTemplate,
}: MobilePreviewOverlayProps) {
  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            {onToggleCustomizer && (
              <Button
                variant={showCustomizer ? "secondary" : "ghost"}
                size="icon"
                onClick={onToggleCustomizer}
                className="h-9 w-9"
                title={showCustomizer ? "Hide customizer" : "Customize template"}
              >
                <Palette className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {/* Template Selector */}
        {onChangeTemplate && (
          <div className="px-4 pt-4 pb-2 border-b">
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

        <div className="flex-1 overflow-auto">
          {showCustomizer && customization && onCustomizationChange && onResetCustomization ? (
            <div className="p-4 pb-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Customize Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCustomizer}
                  className="gap-2"
                >
                  Done
                </Button>
              </div>
              <TemplateCustomizer
                customization={customization}
                onChange={onCustomizationChange}
                onReset={onResetCustomization}
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="min-w-[210mm]" style={{ zoom: 0.35 }}>
                <TemplateRenderer
                  templateId={templateId}
                  data={resumeData}
                  customization={customization}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating "Show Form" Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button size="lg" onClick={onClose} className="rounded-full shadow-lg">
          <FileText className="w-5 h-5 mr-2" />
          Show Form
        </Button>
      </div>
    </div>
  );
}
