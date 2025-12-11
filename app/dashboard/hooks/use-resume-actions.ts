import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeData } from "@/lib/types/resume";
import { exportToPDF, exportToDOCX } from "@/lib/services/export";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { toast } from "sonner";

export function useResumeActions(
  deleteResume: (id: string) => Promise<boolean>
) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [exportingDocxId, setExportingDocxId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
  }) => {
    setExportingPdfId(resume.id);
    try {
      const result = await exportToPDF(resume.data, resume.templateId, {
        fileName: `${resume.name}-${resume.id}.pdf`,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `${resume.name}-${resume.id}.pdf`);
        toast.success("Resume exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF.");
      }
    } catch (error) {
      console.error("PDF export error:", error);
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

  const handleExportDOCX = async (resume: {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
  }) => {
    setExportingDocxId(resume.id);
    try {
      const result = await exportToDOCX(resume.data, resume.templateId, {
        fileName: `${resume.name}-${resume.id}.docx`,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `${resume.name}-${resume.id}.docx`);
        toast.success("Resume exported as DOCX");
      } else {
        toast.error(result.error || "Failed to export DOCX.");
      }
    } catch (error) {
      console.error("DOCX export error:", error);
      toast.error("Failed to export DOCX. Please try again.");
    } finally {
      setExportingDocxId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteResume(id);
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Failed to delete resume. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDeleteDialog = (resume: { id: string; name: string }) => {
    setPendingDelete({ id: resume.id, name: resume.name });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await handleDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  return {
    handleLoadResume,
    handleExportPDF,
    handleExportJSON,
    handleExportDOCX,
    handleOpenDeleteDialog,
    confirmDelete,
    deletingId,
    exportingPdfId,
    exportingDocxId,
    pendingDelete,
    setPendingDelete,
  };
}
