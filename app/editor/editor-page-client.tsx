"use client";

import { Suspense } from "react";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { ErrorBoundary } from "@/components/error-boundary";
import { ResumeEditorSkeleton } from "@/components/loading-skeleton";
import { AuthGuard } from "@/components/auth/auth-guard";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { ColorPaletteId } from "@/lib/constants/color-palettes";
import { SectionId } from "@/lib/constants/defaults";

interface EditorPageClientProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string;
  colorPaletteId?: ColorPaletteId;
  initializeFromLatest?: boolean;
  openTemplateGalleryOnLoad?: boolean;
  initialSection?: SectionId;
}

export function EditorPageClient({
  templateId,
  jobTitle,
  resumeId,
  colorPaletteId,
  initializeFromLatest = false,
  openTemplateGalleryOnLoad = false,
  initialSection,
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
            colorPaletteId={colorPaletteId}
            initializeFromLatest={initializeFromLatest}
            openTemplateGalleryOnLoad={openTemplateGalleryOnLoad}
            initialSection={initialSection}
          />
        </Suspense>
      </ErrorBoundary>
    </AuthGuard>
  );
}
