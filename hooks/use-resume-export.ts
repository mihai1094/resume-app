"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { ResumeExportEnvelope } from "@/lib/types/resume";
import { capture } from "@/lib/analytics/events";
import { useUser } from "@/hooks/use-user";

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
  const { user } = useUser();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportWarningModal, setShowExportWarningModal] = useState(false);
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const handleExportJSON = useCallback(() => {
    setIsExporting(true);
    try {
      const envelope: ResumeExportEnvelope = {
        _type: "resumezeus-resume",
        _version: 1,
        templateId: selectedTemplateId,
        customization: templateCustomization as unknown as Record<string, unknown>,
        data: resumeData,
      };
      downloadJSON(envelope, `resume-${Date.now()}.json`);
      toast.success("Resume exported as JSON");
    } finally {
      setIsExporting(false);
    }
  }, [resumeData, selectedTemplateId, templateCustomization]);

  const performExportPDF = useCallback(async () => {
    if (!user?.emailVerified) {
      toast.error("Verify your email to export PDFs.", {
        description: "Check your inbox for the verification link.",
        action: { label: "Verify email", onClick: () => router.push("/verify-email") },
        duration: 6000,
      });
      return;
    }
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
  }, [resumeData, selectedTemplateId, templateCustomization, router, user?.emailVerified]);

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
