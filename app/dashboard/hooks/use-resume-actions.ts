import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeData } from "@/lib/types/resume";
import { exportToPDF } from "@/lib/services/export";
import { toast } from "sonner";

export function useResumeActions(
  deleteResume: (id: string) => Promise<boolean>
) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
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
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resume.name}-${resume.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
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
    const dataStr = JSON.stringify(resume.data, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.name}-${resume.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
    handleOpenDeleteDialog,
    confirmDelete,
    deletingId,
    exportingPdfId,
    pendingDelete,
    setPendingDelete,
  };
}
