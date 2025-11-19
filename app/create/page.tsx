"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { ErrorBoundary } from "@/components/error-boundary";
import { ResumeEditorSkeleton } from "@/components/loading-skeleton";

function CreateResumeContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template") || "modern";

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

  return <ResumeEditor templateId={template} />;
}

export default function CreateResumePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ResumeEditorSkeleton />}>
        <CreateResumeContent />
      </Suspense>
    </ErrorBoundary>
  );
}
