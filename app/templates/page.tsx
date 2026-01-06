import { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { TemplateGalleryContent } from "@/components/templates/template-gallery-content";

export const metadata: Metadata = {
  title: "Choose Your Template | ResumeForge",
  description:
    "Browse and customize professional resume templates. Filter by layout, style, and industry. Choose colors and start building your resume instantly.",
  openGraph: {
    title: "Choose Your Template | ResumeForge",
    description:
      "Browse and customize professional resume templates with instant color preview.",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BackButton fallback="/" label="Back" variant="ghost" size="sm" />
          </div>
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Choose Your Template
            </h1>
            <p className="text-muted-foreground mt-2">
              Select a template and customize the colors. You can always change it later.
            </p>
          </div>
        </div>

        {/* Gallery */}
        <TemplateGalleryContent />
      </div>
    </div>
  );
}
