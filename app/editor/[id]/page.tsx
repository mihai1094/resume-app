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
}

export default async function EditorByIdPage({ params }: EditorByIdPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingPage />}>
      <EditorPageClient resumeId={id} />
    </Suspense>
  );
}
