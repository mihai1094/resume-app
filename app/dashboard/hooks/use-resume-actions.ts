import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ResumeData } from "@/lib/types/resume";
import { exportToPDF } from "@/lib/services/export";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { toast } from "sonner";

export function useResumeActions(
  deleteResume: (id: string) => Promise<boolean>
) {
  const router = useRouter();

  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const pendingDeleteRef = useRef<Set<string>>(new Set());

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

  const commitDelete = async (id: string) => {
    if (!pendingDeleteRef.current.has(id)) return;

    const next = new Set(pendingDeleteRef.current);
    next.delete(id);
    pendingDeleteRef.current = next;
    setPendingDeleteIds(new Set(next));

    try {
      await deleteResume(id);
    } catch {
      toast.error("Failed to delete resume. Please try again.");
    }
  };

  const handleOpenDeleteDialog = (resume: { id: string; name: string }) => {
    const { id, name } = resume;

    const next = new Set(pendingDeleteRef.current).add(id);
    pendingDeleteRef.current = next;
    setPendingDeleteIds(new Set(next));

    toast(`"${name}" deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          const undoSet = new Set(pendingDeleteRef.current);
          undoSet.delete(id);
          pendingDeleteRef.current = undoSet;
          setPendingDeleteIds(new Set(undoSet));
        },
      },
      duration: 8000,
      onAutoClose: () => commitDelete(id),
      onDismiss: () => commitDelete(id),
    });
  };

  return {
    handleLoadResume,
    handleExportPDF,
    handleExportJSON,
    handleOpenDeleteDialog,
    exportingPdfId,
    pendingDeleteIds,
  };
}
