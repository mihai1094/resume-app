import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { createPageMetadata } from "@/lib/seo/metadata";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";

export const metadata: Metadata = createPageMetadata;

interface EditorNewPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function EditorNewPage({ searchParams }: EditorNewPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateParam =
    typeof resolvedSearchParams.template === "string"
      ? resolvedSearchParams.template
      : undefined;
  const jobTitle =
    typeof resolvedSearchParams.jobTitle === "string"
      ? resolvedSearchParams.jobTitle
      : undefined;

  const templateId: TemplateId | undefined = templateParam &&
    TEMPLATES.some((template) => template.id === templateParam)
      ? (templateParam as TemplateId)
      : undefined;

  return (
    <EditorPageClient templateId={templateId} jobTitle={jobTitle} />
  );
}
