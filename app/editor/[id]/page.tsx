import { Suspense } from "react";
import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { LoadingPage } from "@/components/shared/loading";

export const metadata: Metadata = {
  title: "Edit Resume - ResumeForge",
  description: "Update your resume with our guided editor.",
};

interface EditorByIdPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function EditorByIdPage({
  params,
  searchParams,
}: EditorByIdPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const openTemplateParam =
    typeof query.openTemplate === "string" ? query.openTemplate : undefined;
  const openTemplateGalleryOnLoad =
    openTemplateParam === "1" ||
    openTemplateParam === "true" ||
    openTemplateParam === "yes";

  return (
    <Suspense fallback={<LoadingPage />}>
      <EditorPageClient
        resumeId={id}
        openTemplateGalleryOnLoad={openTemplateGalleryOnLoad}
      />
    </Suspense>
  );
}
