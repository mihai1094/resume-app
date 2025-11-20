"use client";

import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import { TemplateId } from "@/lib/constants/templates";

interface MobilePreviewOverlayProps {
  templateId: TemplateId;
  resumeData: ResumeData;
  onClose: () => void;
  customization?: TemplateCustomization;
}

export function MobilePreviewOverlay({
  templateId,
  resumeData,
  onClose,
  customization,
}: MobilePreviewOverlayProps) {
  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[210mm]" style={{ zoom: 0.35 }}>
            <TemplateRenderer
              templateId={templateId}
              data={resumeData}
              customization={customization}
            />
          </div>
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
