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
  const params = await searchParams;

  const templateParam =
    typeof params.template === "string" ? params.template : undefined;
  const jobTitle =
    typeof params.jobTitle === "string" ? params.jobTitle : undefined;
  const importParam =
    typeof params.import === "string" ? params.import === "true" : false;

  const templateId: TemplateId | undefined =
    templateParam && TEMPLATES.some((template) => template.id === templateParam)
      ? (templateParam as TemplateId)
      : undefined;

  return <EditorPageClient templateId={templateId} jobTitle={jobTitle} isImporting={importParam} />;
}
