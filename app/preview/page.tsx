import { Metadata } from "next";
import { TEMPLATES } from "@/lib/constants";
import { previewPageMetadata, generateTemplateMetadata } from "@/lib/seo/metadata";
import { PreviewContent } from "./preview-content";

type Props = {
  searchParams: Promise<{ template?: string }>;
};

// Dynamic metadata generation based on template parameter
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const templateId = params.template;

  if (templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      return generateTemplateMetadata(
        template.id,
        template.name,
        template.description,
        template.industry
      );
    }
  }

  // Default metadata for gallery view
  return previewPageMetadata;
}

export default function PreviewPage() {
  return <PreviewContent />;
}
