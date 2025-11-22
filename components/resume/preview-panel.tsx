"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, Check } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateId } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { TemplateRenderer } from "./template-renderer";

interface PreviewPanelProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  isValid: boolean;
  className?: string;
  customization?: TemplateCustomization;
  onChangeTemplate?: () => void;
}

export function PreviewPanel({
  templateId,
  resumeData,
  isValid,
  className,
  customization,
  onChangeTemplate,
}: PreviewPanelProps) {

  return (
    <div className={className}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Live Preview</h3>
            {onChangeTemplate && (
              <>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <button
                  onClick={onChangeTemplate}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Change Template
                </button>
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
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-16rem)]">
            <div className="p-4 min-w-[210mm]" style={{ zoom: 0.4 }}>
              <TemplateRenderer
                templateId={templateId}
                data={resumeData}
                customization={customization}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
