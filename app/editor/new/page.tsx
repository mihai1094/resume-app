import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { createPageMetadata } from "@/lib/seo/metadata";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";

export const metadata: Metadata = createPageMetadata;

interface EditorNewPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function EditorNewPage({ searchParams }: EditorNewPageProps) {
  const templateParam =
    typeof searchParams.template === "string"
      ? searchParams.template
      : undefined;
  const jobTitle =
    typeof searchParams.jobTitle === "string"
      ? searchParams.jobTitle
      : undefined;

  const templateId: TemplateId | undefined =
    templateParam &&
    TEMPLATES.some((template) => template.id === templateParam)
      ? (templateParam as TemplateId)
      : undefined;

  return (
    <EditorPageClient templateId={templateId} jobTitle={jobTitle} />
  );
}
