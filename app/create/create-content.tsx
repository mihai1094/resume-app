"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { ErrorBoundary } from "@/components/error-boundary";
import { ResumeEditorSkeleton } from "@/components/loading-skeleton";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { AuthGuard } from "@/components/auth/auth-guard";

function CreateResumeContent() {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const jobTitleParam = searchParams.get("jobTitle");

  // Validate template parameter and ensure it's a valid TemplateId
  const validTemplateIds = TEMPLATES.map((t) => t.id);
  const template: TemplateId =
    (templateParam && validTemplateIds.includes(templateParam as TemplateId))
      ? (templateParam as TemplateId)
      : "modern";

  // Check if there's a resume to load from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const resumeToLoad = sessionStorage.getItem("resume-to-load");
      if (resumeToLoad) {
        // Resume will be loaded by ResumeEditor component
        // Clear it after a moment to prevent reloading
        setTimeout(() => {
          sessionStorage.removeItem("resume-to-load");
        }, 1000);
      }
    }
  }, []);

  return <ResumeEditor templateId={template} jobTitle={jobTitleParam || undefined} />;
}

export function CreatePageClient() {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <Suspense fallback={<ResumeEditorSkeleton />}>
          <CreateResumeContent />
        </Suspense>
      </ErrorBoundary>
    </AuthGuard>
  );
}





