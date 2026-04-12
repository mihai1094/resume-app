import { Suspense } from "react";
import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { LoadingPage } from "@/components/shared/loading";
import { isValidSectionId, SectionId } from "@/lib/constants/defaults";

export const metadata: Metadata = {
  title: "Edit Resume",
  description: "Update your resume with our guided editor.",
  robots: {
    index: false,
    follow: false,
  },
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
  const sectionParam =
    typeof query.section === "string" ? query.section : undefined;
  const openTemplateGalleryOnLoad =
    openTemplateParam === "1" ||
    openTemplateParam === "true" ||
    openTemplateParam === "yes";
  const initialSection: SectionId | undefined =
    sectionParam && isValidSectionId(sectionParam) ? sectionParam : undefined;

  return (
    <Suspense fallback={<LoadingPage />}>
      <EditorPageClient
        resumeId={id}
        openTemplateGalleryOnLoad={openTemplateGalleryOnLoad}
        initialSection={initialSection}
      />
    </Suspense>
  );
}
