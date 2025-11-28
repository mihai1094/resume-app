import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";

export const metadata: Metadata = {
  title: "Edit Resume - ResumeForge",
  description: "Update your resume with our guided editor.",
};

interface EditorByIdPageProps {
  params: {
    id: string;
  };
}

export default function EditorByIdPage({ params }: EditorByIdPageProps) {
  return <EditorPageClient resumeId={params.id} />;
}
