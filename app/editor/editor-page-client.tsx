"use client";

import { Suspense } from "react";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { ErrorBoundary } from "@/components/error-boundary";
import { ResumeEditorSkeleton } from "@/components/loading-skeleton";
import { AuthGuard } from "@/components/auth/auth-guard";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { ColorPaletteId } from "@/lib/constants/color-palettes";

interface EditorPageClientProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string;
  isImporting?: boolean;
  colorPaletteId?: ColorPaletteId;
}

export function EditorPageClient({
  templateId,
  jobTitle,
  resumeId,
  isImporting,
  colorPaletteId,
}: EditorPageClientProps) {
  const fallbackTemplate: TemplateId =
    templateId && TEMPLATES.some((t) => t.id === templateId)
      ? templateId
      : "modern";

  return (
    <AuthGuard>
      <ErrorBoundary>
        <Suspense fallback={<ResumeEditorSkeleton />}>
          <ResumeEditor
            templateId={fallbackTemplate}
            jobTitle={jobTitle}
            resumeId={resumeId}
            isImporting={isImporting}
            colorPaletteId={colorPaletteId}
          />
        </Suspense>
      </ErrorBoundary>
    </AuthGuard>
  );
}
