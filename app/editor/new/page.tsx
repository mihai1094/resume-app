import { Suspense } from "react";
import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { createPageMetadata } from "@/lib/seo/metadata";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { COLOR_PALETTES, ColorPaletteId } from "@/lib/constants/color-palettes";
import { LoadingPage } from "@/components/shared/loading";

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
  const colorParam =
    typeof params.color === "string" ? params.color : undefined;

  const templateId: TemplateId | undefined =
    templateParam && TEMPLATES.some((template) => template.id === templateParam)
      ? (templateParam as TemplateId)
      : undefined;

  // Validate color palette ID
  const colorPaletteId: ColorPaletteId | undefined =
    colorParam && COLOR_PALETTES.some((p) => p.id === colorParam)
      ? (colorParam as ColorPaletteId)
      : undefined;

  return (
    <Suspense fallback={<LoadingPage />}>
      <EditorPageClient
        templateId={templateId}
        jobTitle={jobTitle}
        isImporting={importParam}
        colorPaletteId={colorPaletteId}
      />
    </Suspense>
  );
}
