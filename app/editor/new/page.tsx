import { Suspense } from "react";
import { Metadata } from "next";
import { EditorPageClient } from "../editor-page-client";
import { createPageMetadata } from "@/lib/seo/metadata";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { COLOR_PALETTES, ColorPaletteId } from "@/lib/constants/color-palettes";
import { LoadingPage } from "@/components/shared/loading";
import { isValidSectionId, SectionId } from "@/lib/constants/defaults";

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
  const colorParam =
    typeof params.color === "string" ? params.color : undefined;
  const continueParam =
    typeof params.continue === "string" ? params.continue : undefined;
  const sectionParam =
    typeof params.section === "string" ? params.section : undefined;

  const templateId: TemplateId | undefined =
    templateParam && TEMPLATES.some((template) => template.id === templateParam)
      ? (templateParam as TemplateId)
      : undefined;

  // Validate color palette ID
  const colorPaletteId: ColorPaletteId | undefined =
    colorParam && COLOR_PALETTES.some((p) => p.id === colorParam)
      ? (colorParam as ColorPaletteId)
      : undefined;

  // Auto-resume the autosaved draft when:
  //   (a) user explicitly asks via ?continue=1
  //   (b) user navigates to /editor/new organically with no template param (returning from dashboard, etc.)
  // If ?template=X is present, the user wants a fresh start with that template — skip resume.
  const initializeFromLatest =
    continueParam === "1" ||
    continueParam === "true" ||
    continueParam === "yes" ||
    !templateParam;
  const initialSection: SectionId | undefined =
    sectionParam && isValidSectionId(sectionParam) ? sectionParam : undefined;

  return (
    <Suspense fallback={<LoadingPage />}>
      <EditorPageClient
        templateId={templateId}
        jobTitle={jobTitle}
        colorPaletteId={colorPaletteId}
        initializeFromLatest={initializeFromLatest}
        initialSection={initialSection}
      />
    </Suspense>
  );
}
