import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeData } from "@/lib/types/resume";
import { exportToPDF, PDFCustomization } from "@/lib/services/export";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { toast } from "sonner";
import { logger } from "@/lib/services/logger";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";

export function useResumeActions(
  deleteResume: (id: string) => Promise<boolean>
) {
  const router = useRouter();

  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingResume, setIsDeletingResume] = useState(false);

  const handleLoadResume = (resume: {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
  }) => {
    router.push(`/editor/${resume.id}`);
  };

  const handleExportPDF = async (resume: {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
    customization?: TemplateCustomizationDefaults | Record<string, unknown>;
  }) => {
    setExportingPdfId(resume.id);
    try {
      const result = await exportToPDF(resume.data, resume.templateId, {
        fileName: `${resume.name}-${resume.id}.pdf`,
        customization: resume.customization as PDFCustomization | undefined,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `${resume.name}-${resume.id}.pdf`);
        toast.success("Resume exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF.");
      }
    } catch (error) {
      logger.error("PDF export error", error, { module: "ResumeActions" });
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExportingPdfId(null);
    }
  };

  const handleExportJSON = (resume: {
    id: string;
    name: string;
    data: ResumeData;
  }) => {
    downloadJSON(resume.data, `${resume.name}-${resume.id}.json`);
    toast.success("Resume exported as JSON");
  };

  const handleOpenDeleteDialog = (resume: { id: string; name: string }) => {
    setPendingDelete(resume);
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeletingResume(true);
    try {
      const success = await deleteResume(pendingDelete.id);
      if (success) {
        toast.success(`"${pendingDelete.name}" has been deleted.`);
      } else {
        toast.error("Failed to delete resume. Please try again.");
      }
    } catch {
      toast.error("Failed to delete resume. Please try again.");
    } finally {
      setIsDeletingResume(false);
      setPendingDelete(null);
    }
  };

  return {
    handleLoadResume,
    handleExportPDF,
    handleExportJSON,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    handleCancelDelete,
    exportingPdfId,
    pendingDelete,
    isDeletingResume,
  };
}
