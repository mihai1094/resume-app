"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { capture } from "@/lib/analytics/events";

interface UseResumeExportOptions {
  resumeData: ResumeData;
  selectedTemplateId: TemplateId;
  templateCustomization: TemplateCustomizationDefaults;
}

export function useResumeExport({
  resumeData,
  selectedTemplateId,
  templateCustomization,
}: UseResumeExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportWarningModal, setShowExportWarningModal] = useState(false);
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const handleExportJSON = useCallback(() => {
    setIsExporting(true);
    try {
      downloadJSON(resumeData, `resume-${Date.now()}.json`);
      toast.success("Resume exported as JSON");
    } finally {
      setIsExporting(false);
    }
  }, [resumeData]);

  const performExportPDF = useCallback(async () => {
    setShowExportWarningModal(false);
    setIsExporting(true);
    const loadingId = toast.loading("Preparing PDF...");
    try {
      const { exportToPDF } = await import("@/lib/services/export");
      const result = await exportToPDF(resumeData, selectedTemplateId, {
        fileName: `resume-${Date.now()}.pdf`,
        customization: templateCustomization,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `resume-${Date.now()}.pdf`);
        capture("pdf_exported", { templateId: selectedTemplateId });
        toast.success("Resume exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF. Check your content or try another template.", {
          duration: 5000,
        });
      }
    } catch {
      toast.error("Failed to export PDF. Please try again.", { duration: 5000 });
    } finally {
      toast.dismiss(loadingId);
      setIsExporting(false);
    }
  }, [resumeData, selectedTemplateId, templateCustomization]);

  const handleExportPDF = useCallback(async () => {
    const { getResumeWarnings } = await import("@/lib/utils/resume");
    const warnings = getResumeWarnings(resumeData);

    if (warnings.length > 0) {
      setExportWarnings(warnings);
      setShowExportWarningModal(true);
      return;
    }

    await performExportPDF();
  }, [resumeData, performExportPDF]);

  return {
    isExporting,
    showExportWarningModal,
    setShowExportWarningModal,
    exportWarnings,
    handleExportJSON,
    handleExportPDF,
    performExportPDF,
  };
}
